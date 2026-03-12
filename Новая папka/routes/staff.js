const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { userValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      role = '',
      status = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', auth, authorize('admin'), validate(userValidation.create), async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Get next user ID
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;
    
    const userData = {
      ...req.body,
      id: nextId
    };
    
    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', auth, authorize('admin'), validate(userValidation.update), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Don't allow password update through this endpoint
    delete updateData.password;
    
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Prevent deletion of the current user
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findOneAndDelete({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change user password (admin only)
router.patch('/:id/password', auth, authorize('admin'), async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = password;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user active status (admin only)
router.patch('/:id/toggle', auth, authorize('admin'), async (req, res) => {
  try {
    // Prevent deactivation of the current user
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user permissions
router.get('/permissions/list', auth, authorize('admin'), async (req, res) => {
  try {
    const permissions = {
      orders: 'Manage orders and clients',
      companies: 'Manage companies and documents',
      finance: 'Access financial reports and payments',
      staff: 'Manage staff and users',
      settings: 'Change system settings'
    };
    
    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user permissions (admin only)
router.patch('/:id/permissions', auth, authorize('admin'), async (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ message: 'Invalid permissions object' });
    }
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate permission fields
    const validPermissions = ['orders', 'companies', 'finance', 'staff', 'settings'];
    const updatePermissions = {};
    
    validPermissions.forEach(perm => {
      if (permissions.hasOwnProperty(perm)) {
        updatePermissions[perm] = Boolean(permissions[perm]);
      }
    });
    
    user.permissions = { ...user.permissions, ...updatePermissions };
    await user.save();
    
    res.json({
      message: 'Permissions updated successfully',
      permissions: user.permissions
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get staff list for dropdowns
router.get('/staff/list', auth, async (req, res) => {
  try {
    const staff = await User.find({ 
      isActive: true,
      role: { $in: ['translator', 'reception', 'admin'] }
    }).select('id name email role').sort({ name: 1 });
    
    res.json({ staff });
  } catch (error) {
    console.error('Get staff list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
