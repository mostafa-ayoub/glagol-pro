const express = require('express');
const Company = require('../models/Company');
const CompanyDoc = require('../models/CompanyDoc');
const Order = require('../models/Order');
const { auth, checkPermission } = require('../middleware/auth');
const { companyValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Get all companies
router.get('/', auth, checkPermission('companies'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      status = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'representative.name': { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const companies = await Company.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Company.countDocuments(query);
    
    res.json({
      companies,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single company
router.get('/:id', auth, checkPermission('companies'), async (req, res) => {
  try {
    const company = await Company.findOne({ id: req.params.id });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get company documents
    const documents = await CompanyDoc.find({ companyId: company.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get company orders
    const orders = await Order.find({ 'client.name': company.name })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      company,
      documents,
      orders
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new company
router.post('/', auth, checkPermission('companies'), validate(companyValidation.create), async (req, res) => {
  try {
    // Get next company ID
    const lastCompany = await Company.findOne().sort({ id: -1 });
    const nextId = lastCompany ? lastCompany.id + 1 : 1;
    
    const companyData = {
      ...req.body,
      id: nextId
    };
    
    const company = await Company.create(companyData);
    
    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company
router.put('/:id', auth, checkPermission('companies'), validate(companyValidation.update), async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json({
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete company
router.delete('/:id', auth, checkPermission('companies'), async (req, res) => {
  try {
    // Check if company has related documents or orders
    const docCount = await CompanyDoc.countDocuments({ companyId: req.params.id });
    const orderCount = await Order.countDocuments({ 'client.name': req.params.id });
    
    if (docCount > 0 || orderCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete company with existing documents or orders' 
      });
    }
    
    const company = await Company.findOneAndDelete({ id: req.params.id });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company debts
router.get('/debts/list', auth, checkPermission('finance'), async (req, res) => {
  try {
    const companies = await Company.find({
      'financial.totalDebt': { $gt: 0 }
    }).sort({ 'financial.totalDebt': -1 });
    
    const debts = companies.map(company => ({
      id: company.id,
      name: company.name,
      representative: company.representative,
      phone: company.phone,
      email: company.email,
      totalRevenue: company.financial.totalRevenue,
      totalPaid: company.financial.totalPaid,
      totalDebt: company.financial.totalDebt,
      creditLimit: company.financial.creditLimit,
      status: company.status
    }));
    
    res.json({ debts });
  } catch (error) {
    console.error('Get debts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company financials
router.patch('/:id/financials', auth, checkPermission('finance'), async (req, res) => {
  try {
    const { revenue, payment } = req.body;
    
    const company = await Company.findOne({ id: req.params.id });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    if (revenue) {
      company.financial.totalRevenue += revenue;
    }
    
    if (payment) {
      company.financial.totalPaid += payment;
    }
    
    company.calculateDebt();
    await company.save();
    
    res.json({
      message: 'Financials updated successfully',
      company
    });
  } catch (error) {
    console.error('Update financials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company statement
router.get('/:id/statement', auth, checkPermission('companies'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const company = await Company.findOne({ id: req.params.id });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Get company documents
    const documents = await CompanyDoc.find({
      companyId: company.id,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }).sort({ date: 1 });
    
    // Get company orders
    const orders = await Order.find({
      'client.name': company.name,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }).sort({ date: 1 });
    
    // Calculate totals
    const totalDocuments = documents.reduce((sum, doc) => sum + doc.totals.total, 0);
    const totalOrders = orders.reduce((sum, order) => sum + order.totals.total, 0);
    const totalRevenue = totalDocuments + totalOrders;
    const totalPaid = documents.reduce((sum, doc) => sum + doc.totals.paid, 0) +
                     orders.reduce((sum, order) => sum + order.totals.paid, 0);
    const totalDebt = totalRevenue - totalPaid;
    
    res.json({
      company,
      period: { startDate, endDate },
      documents,
      orders,
      summary: {
        totalDocuments,
        totalOrders,
        totalRevenue,
        totalPaid,
        totalDebt
      }
    });
  } catch (error) {
    console.error('Get statement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
