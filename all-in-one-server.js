const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const serviceRoutes = require('./routes/services');
const companyRoutes = require('./routes/companies');
const staffRoutes = require('./routes/staff');
const dashboardRoutes = require('./routes/dashboard');

// Import models
const Settings = require('./models/Settings');
const Service = require('./models/Service');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static(__dirname, {
  index: 'glagol-pro-v5.html',
  extensions: ['html']
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'glagol-pro-v5.html'));
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'glagol-pro-v5.html');
  console.log('Serving file:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving file:', err);
      res.status(500).send('Error loading frontend');
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/glagol_pro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Initialize default data
  await initializeDefaultData();
  
  // Start server
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Glagol Pro Server running on http://${HOST}:${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://YOUR_IP:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });
})
.catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Initialize default data
async function initializeDefaultData() {
  try {
    console.log('🔧 Initializing default data...');
    
    // Create default settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
      console.log('✅ Default settings created');
    }
    
    // Create default services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const defaultServices = [
        {
          id: 1,
          name: { ar: 'ترجمة رسمية', ru: 'Официальный перевод' },
          category: 'translation',
          basePrice: 1500,
          translatorFee: 800,
          notaryFee: 500,
          unit: 'document'
        },
        {
          id: 2,
          name: { ar: 'ترجمة عادية', ru: 'Обычный перевод' },
          category: 'translation',
          basePrice: 800,
          translatorFee: 500,
          notaryFee: 0,
          unit: 'page'
        },
        {
          id: 3,
          name: { ar: 'توثيق', ru: 'Нотариальное заверение' },
          category: 'notary',
          basePrice: 500,
          translatorFee: 0,
          notaryFee: 500,
          unit: 'document'
        },
        {
          id: 4,
          name: { ar: 'تصديق', ru: 'Апостиль' },
          category: 'legal',
          basePrice: 2000,
          translatorFee: 0,
          notaryFee: 1000,
          unit: 'document'
        }
      ];
      
      await Service.insertMany(defaultServices);
      console.log('✅ Default services created');
    }
    
    // Create admin user if not exists
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      await User.create({
        id: 1,
        name: 'Administrator',
        email: 'admin@glagol.pro',
        password: settings.passwords.admin,
        role: 'admin',
        permissions: {
          orders: true,
          companies: true,
          finance: true,
          staff: true,
          settings: true
        }
      });
      console.log('✅ Admin user created');
    }
    
    console.log('🎉 Default data initialization completed');
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
}

module.exports = app;
