const express = require('express');
const Service = require('../models/Service');
const { auth, checkPermission } = require('../middleware/auth');
const { serviceValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Get all services
router.get('/', auth, async (req, res) => {
  try {
    const { category, active = true } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (active !== 'all') query.isActive = active === 'true';
    
    const services = await Service.find(query).sort({ sortOrder: 1, name: 1 });
    
    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single service
router.get('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new service
router.post('/', auth, checkPermission('settings'), validate(serviceValidation.create), async (req, res) => {
  try {
    // Get next service ID
    const lastService = await Service.findOne().sort({ id: -1 });
    const nextId = lastService ? lastService.id + 1 : 1;
    
    const serviceData = {
      ...req.body,
      id: nextId
    };
    
    const service = await Service.create(serviceData);
    
    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Service ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/:id', auth, checkPermission('settings'), validate(serviceValidation.update), async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
router.delete('/:id', auth, checkPermission('settings'), async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ id: req.params.id });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder services
router.patch('/reorder', auth, checkPermission('settings'), async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 1 }]
    
    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid orders array' });
    }
    
    const updatePromises = orders.map(({ id, sortOrder }) =>
      Service.updateOne({ id }, { sortOrder })
    );
    
    await Promise.all(updatePromises);
    
    res.json({ message: 'Services reordered successfully' });
  } catch (error) {
    console.error('Reorder services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get services by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { active = true } = req.query;
    
    const query = { category };
    if (active !== 'all') query.isActive = active === 'true';
    
    const services = await Service.find(query).sort({ sortOrder: 1 });
    
    res.json({ services });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle service active status
router.patch('/:id/toggle', auth, checkPermission('settings'), async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    service.isActive = !service.isActive;
    await service.save();
    
    res.json({
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service
    });
  } catch (error) {
    console.error('Toggle service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
