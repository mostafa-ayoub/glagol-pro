const express = require('express');
const Order = require('../models/Order');
const { auth, checkPermission } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Get all orders with filtering and pagination
router.get('/', auth, checkPermission('orders'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      status = '',
      workflow = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.phone': { $regex: search, $options: 'i' } },
        { orderRef: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (workflow) {
      query.workflow = workflow;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const orders = await Order.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('staffId', 'name email');
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, checkPermission('orders'), async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id }).populate('staffId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', auth, checkPermission('orders'), validate(orderValidation.create), async (req, res) => {
  try {
    // Get next order ID
    const lastOrder = await Order.findOne().sort({ id: -1 });
    const nextId = lastOrder ? lastOrder.id + 1 : 1;
    
    const orderData = {
      ...req.body,
      id: nextId
    };
    
    const order = await Order.create(orderData);
    
    // Populate staff info
    await order.populate('staffId', 'name email');
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate order reference' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order
router.put('/:id', auth, checkPermission('orders'), validate(orderValidation.update), async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('staffId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', auth, checkPermission('orders'), async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order workflow
router.patch('/:id/workflow', auth, checkPermission('orders'), async (req, res) => {
  try {
    const { workflow } = req.body;
    
    if (!['new', 'translate', 'review', 'notary', 'ready', 'delivered', 'cancelled'].includes(workflow)) {
      return res.status(400).json({ message: 'Invalid workflow status' });
    }
    
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { workflow },
      { new: true }
    ).populate('staffId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Workflow updated successfully',
      order
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add payment to order
router.post('/:id/payment', auth, checkPermission('finance'), async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }
    
    const order = await Order.findOne({ id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.totals.paid = Math.min(order.totals.paid + amount, order.totals.total);
    order.totals.remaining = Math.max(0, order.totals.total - order.totals.paid);
    
    if (order.totals.remaining <= 0) {
      order.status = 'done';
    } else if (order.totals.paid > 0) {
      order.status = 'partial';
    }
    
    await order.save();
    await order.populate('staffId', 'name email');
    
    res.json({
      message: 'Payment added successfully',
      order
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics
router.get('/stats/dashboard', auth, checkPermission('orders'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      total: await Order.countDocuments(),
      today: await Order.countDocuments({ date: { $gte: today } }),
      new: await Order.countDocuments({ status: 'new' }),
      partial: await Order.countDocuments({ status: 'partial' }),
      done: await Order.countDocuments({ status: 'done' }),
      cancelled: await Order.countDocuments({ status: 'cancelled' }),
      
      workflow: {
        new: await Order.countDocuments({ workflow: 'new' }),
        translate: await Order.countDocuments({ workflow: 'translate' }),
        review: await Order.countDocuments({ workflow: 'review' }),
        notary: await Order.countDocuments({ workflow: 'notary' }),
        ready: await Order.countDocuments({ workflow: 'ready' }),
        delivered: await Order.countDocuments({ workflow: 'delivered' }),
        cancelled: await Order.countDocuments({ workflow: 'cancelled' })
      },
      
      revenue: {
        today: await Order.aggregate([
          { $match: { date: { $gte: today } } },
          { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]).then(result => result[0]?.total || 0),
        
        thisMonth: await Order.aggregate([
          { 
            $match: { 
              date: { 
                $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
              } 
            } 
          },
          { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
