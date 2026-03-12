const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { loginValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Login endpoint
router.post('/login', validate(loginValidation), async (req, res) => {
  try {
    const { role, password } = req.body;
    
    // Get settings for password validation
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    // Validate password based on role
    let storedPassword;
    switch (role) {
      case 'admin':
        storedPassword = settings.passwords.admin;
        break;
      case 'reception':
        storedPassword = settings.passwords.reception;
        break;
      case 'translator':
        storedPassword = settings.passwords.staff;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }
    
    if (password !== storedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Find or create user record
    let user = await User.findOne({ role });
    if (!user) {
      // Get next ID
      const lastUser = await User.findOne().sort({ id: -1 });
      const nextId = lastUser ? lastUser.id + 1 : 1;
      
      user = await User.create({
        id: nextId,
        name: role === 'admin' ? 'Administrator' : 
              role === 'reception' ? 'Reception Staff' : 'Translator',
        email: `${role}@glagol.pro`,
        password: storedPassword, // Will be hashed by pre-save hook
        role,
        permissions: {
          orders: true,
          companies: true,
          finance: role === 'admin',
          staff: role === 'admin',
          settings: role === 'admin'
        }
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ id: decoded.id }).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
