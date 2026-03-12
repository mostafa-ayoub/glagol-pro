const express = require('express');
const Settings = require('../models/Settings');
const DailyFinance = require('../models/DailyFinance');
const Order = require('../models/Order');
const Company = require('../models/Company');
const CompanyDoc = require('../models/CompanyDoc');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get system settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system settings
router.put('/', auth, authorize('admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    // Update settings
    Object.assign(settings, req.body);
    await settings.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update passwords
router.patch('/passwords', auth, authorize('admin'), async (req, res) => {
  try {
    const { passwords } = req.body;
    
    if (!passwords || typeof passwords !== 'object') {
      return res.status(400).json({ message: 'Invalid passwords object' });
    }
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    // Update passwords
    if (passwords.admin) settings.passwords.admin = passwords.admin;
    if (passwords.reception) settings.passwords.reception = passwords.reception;
    if (passwords.staff) settings.passwords.staff = passwords.staff;
    
    await settings.save();
    
    res.json({
      message: 'Passwords updated successfully',
      passwords: settings.passwords
    });
  } catch (error) {
    console.error('Update passwords error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's stats
    const todayOrders = await Order.countDocuments({ date: { $gte: today } });
    const todayRevenue = await Order.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]).then(result => result[0]?.total || 0);
    
    // Workflow counts
    const workflowCounts = {
      new: await Order.countDocuments({ workflow: 'new' }),
      translate: await Order.countDocuments({ workflow: 'translate' }),
      review: await Order.countDocuments({ workflow: 'review' }),
      notary: await Order.countDocuments({ workflow: 'notary' }),
      ready: await Order.countDocuments({ workflow: 'ready' }),
      delivered: await Order.countDocuments({ workflow: 'delivered' }),
      cancelled: await Order.countDocuments({ workflow: 'cancelled' })
    };
    
    // Company debts
    const companyDebts = await Company.find({
      'financial.totalDebt': { $gt: 0 }
    }).sort({ 'financial.totalDebt': -1 }).limit(5);
    
    // Weekly revenue (last 7 days)
    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const revenue = await Order.aggregate([
        { 
          $match: { 
            date: { 
              $gte: date,
              $lt: nextDate
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totals.total' } } }
      ]).then(result => result[0]?.total || 0);
      
      weeklyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue
      });
    }
    
    // KPIs
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]).then(result => result[0]?.total || 0);
    const totalCompanies = await Company.countDocuments();
    const totalDebt = await Company.aggregate([
      { $group: { _id: null, total: { $sum: '$financial.totalDebt' } } }
    ]).then(result => result[0]?.total || 0);
    
    // Get today's finance record
    let todayFinance = await DailyFinance.findOne({ date: today });
    
    if (!todayFinance) {
      todayFinance = await DailyFinance.create({
        date: today,
        income: { orders: todayRevenue },
        metrics: { ordersCount: todayOrders }
      });
    }
    
    res.json({
      todayStats: {
        orders: todayOrders,
        revenue: todayRevenue,
        newClients: 0, // TODO: Implement new clients tracking
        completedOrders: await Order.countDocuments({ 
          date: { $gte: today },
          workflow: 'delivered'
        })
      },
      workflowCounts,
      companyDebts,
      weeklyRevenue,
      kpis: {
        totalOrders,
        totalRevenue,
        totalCompanies,
        totalDebt
      },
      todayFinance: todayFinance.notes || ''
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save daily notes
router.patch('/daily-notes', auth, async (req, res) => {
  try {
    const { notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyFinance = await DailyFinance.findOne({ date: today });
    
    if (!dailyFinance) {
      dailyFinance = await DailyFinance.create({ date: today });
    }
    
    dailyFinance.notes = notes;
    await dailyFinance.save();
    
    res.json({
      message: 'Daily notes saved successfully',
      notes: dailyFinance.notes
    });
  } catch (error) {
    console.error('Save daily notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get financial reports
router.get('/reports/financial', auth, async (req, res) => {
  try {
    const { startDate, endDate, type = 'monthly' } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    let groupStage;
    if (type === 'daily') {
      groupStage = {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          income: { $sum: '$income.total' },
          expenses: { $sum: '$expenses.total' },
          profit: { $sum: '$profit.net' },
          ordersCount: { $sum: '$metrics.ordersCount' }
        }
      };
    } else if (type === 'monthly') {
      groupStage = {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          income: { $sum: '$income.total' },
          expenses: { $sum: '$expenses.total' },
          profit: { $sum: '$profit.net' },
          ordersCount: { $sum: '$metrics.ordersCount' }
        }
      };
    }
    
    const reports = await DailyFinance.aggregate([
      { $match: matchStage },
      groupStage,
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ reports });
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system statistics
router.get('/stats/system', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      orders: {
        total: await Order.countDocuments(),
        thisMonth: await Order.countDocuments({
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }),
        today: await Order.countDocuments({
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        })
      },
      companies: {
        total: await Company.countDocuments(),
        active: await Company.countDocuments({ status: 'active' }),
        withDebt: await Company.countDocuments({
          'financial.totalDebt': { $gt: 0 }
        })
      },
      revenue: {
        total: await Order.aggregate([
          { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]).then(result => result[0]?.total || 0),
        thisMonth: await Order.aggregate([
          {
            $match: {
              date: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]).then(result => result[0]?.total || 0),
        today: await Order.aggregate([
          {
            $match: {
              date: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]).then(result => result[0]?.total || 0)
      },
      debts: {
        total: await Company.aggregate([
          { $group: { _id: null, total: { $sum: '$financial.totalDebt' } } }
        ]).then(result => result[0]?.total || 0),
        companies: await Company.countDocuments({
          'financial.totalDebt': { $gt: 0 }
        })
      }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
