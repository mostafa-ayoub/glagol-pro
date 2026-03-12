const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Company = require('../models/Company');
const Order = require('../models/Order');
const CompanyDoc = require('../models/CompanyDoc');
const Settings = require('../models/Settings');
const DailyFinance = require('../models/DailyFinance');

// Sample data for seeding
const sampleUsers = [
  {
    id: 2,
    name: 'أحمد محمد',
    email: 'ahmed@glagol.pro',
    password: 'staff123',
    role: 'translator',
    phone: '+7 926 123-45-67',
    nationality: 'مصري',
    specialization: 'الترجمة العربية-الروسية',
    hourlyRate: 1500,
    permissions: {
      orders: true,
      companies: true,
      finance: false,
      staff: false,
      settings: false
    }
  },
  {
    id: 3,
    name: 'مريم إبراهيم',
    email: 'mariam@glagol.pro',
    password: 'recep123',
    role: 'reception',
    phone: '+7 916 234-56-78',
    nationality: 'سورية',
    permissions: {
      orders: true,
      companies: true,
      finance: false,
      staff: false,
      settings: false
    }
  },
  {
    id: 4,
    name: 'خالد عبدالله',
    email: 'khalid@glagol.pro',
    password: 'staff123',
    role: 'translator',
    phone: '+7 925 345-67-89',
    nationality: 'سعودي',
    specialization: 'الترجمة الإنجليزية-الروسية',
    hourlyRate: 1800,
    permissions: {
      orders: true,
      companies: true,
      finance: false,
      staff: false,
      settings: false
    }
  }
];

const sampleCompanies = [
  {
    id: 1,
    name: 'شركة النور للتجارة',
    representative: {
      name: 'علي نور',
      phone: '+7 495 111-22-33',
      email: 'ali@nour-co.ru'
    },
    address: 'موسكو، شارع أربات 15',
    phone: '+7 495 111-22-33',
    email: 'info@nour-co.ru',
    taxId: '1234567890',
    registrationNumber: 'RU-123-456',
    contractDetails: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      terms: 'شروط الدفع خلال 30 يوم',
      discountRate: 5
    },
    financial: {
      creditLimit: 100000
    }
  },
  {
    id: 2,
    name: 'مؤسسة الأمل للخدمات',
    representative: {
      name: 'فهد الأمل',
      phone: '+7 495 222-33-44',
      email: 'fahad@amal-serv.ru'
    },
    address: 'موسكو، شارع تفيرسكايا 25',
    phone: '+7 495 222-33-44',
    email: 'contact@amal-serv.ru',
    taxId: '0987654321',
    registrationNumber: 'RU-987-654',
    contractDetails: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      terms: 'شروط الدفع خلال 45 يوم',
      discountRate: 3
    },
    financial: {
      creditLimit: 75000
    }
  }
];

const sampleOrders = [
  {
    id: 1,
    orderRef: 'TR-2024-0001',
    client: {
      name: 'محمد أحمد',
      phone: '+7 926 555-44-33',
      email: 'mohammed@email.ru',
      nationality: 'يمني',
      address: 'موسكو، شارع لينين 10'
    },
    items: [
      {
        serviceId: 1,
        serviceName: { ar: 'ترجمة رسمية', ru: 'Официальный перевод' },
        quantity: 2,
        price: 1500,
        translatorFee: 800,
        notaryFee: 500
      }
    ],
    staffId: 2,
    workflow: 'translate',
    status: 'partial',
    priority: 'normal',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: 'عميل مهم، تاريخ مستعجل',
    date: new Date(),
    totals: {
      subtotal: 3000,
      discount: 0,
      total: 3000,
      paid: 1500,
      remaining: 1500
    }
  },
  {
    id: 2,
    orderRef: 'TR-2024-0002',
    client: {
      name: 'فاطمة علي',
      phone: '+7 916 666-55-44',
      nationality: 'سورية',
      address: 'موسكو، شارع بوشكين 5'
    },
    items: [
      {
        serviceId: 3,
        serviceName: { ar: 'توثيق', ru: 'Нотариальное заверение' },
        quantity: 1,
        price: 500,
        translatorFee: 0,
        notaryFee: 500
      }
    ],
    workflow: 'ready',
    status: 'done',
    priority: 'normal',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totals: {
      subtotal: 500,
      discount: 0,
      total: 500,
      paid: 500,
      remaining: 0
    }
  }
];

const sampleCompanyDocs = [
  {
    id: 1,
    orderRef: 'CD-2024-0001',
    companyId: 1,
    title: 'ترجمة عقود العمل',
    description: 'ترجمة 10 عقود عمل من العربية إلى الروسية',
    documentType: 'translation',
    items: [
      {
        serviceId: 1,
        serviceName: 'ترجمة رسمية',
        quantity: 10,
        price: 1500
      }
    ],
    status: 'processing',
    priority: 'normal',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    staffId: 2,
    date: new Date(),
    totals: {
      subtotal: 15000,
      discount: 750, // 5% discount
      total: 14250,
      paid: 0,
      remaining: 14250
    }
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (optional - comment out if you want to preserve existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Order.deleteMany({});
    await CompanyDoc.deleteMany({});
    await DailyFinance.deleteMany({});
    
    // Insert sample users
    console.log('👥 Inserting sample users...');
    await User.insertMany(sampleUsers);
    
    // Insert sample companies
    console.log('🏢 Inserting sample companies...');
    await Company.insertMany(sampleCompanies);
    
    // Insert sample orders
    console.log('📋 Inserting sample orders...');
    await Order.insertMany(sampleOrders);
    
    // Insert sample company documents
    console.log('📄 Inserting sample company documents...');
    await CompanyDoc.insertMany(sampleCompanyDocs);
    
    // Create sample daily finance records
    console.log('💰 Creating sample finance records...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await DailyFinance.create({
        date,
        income: {
          orders: Math.floor(Math.random() * 10000) + 5000,
          companyDocs: Math.floor(Math.random() * 5000) + 1000,
          other: Math.floor(Math.random() * 1000)
        },
        expenses: {
          salaries: 50000,
          rent: 15000,
          utilities: Math.floor(Math.random() * 5000) + 2000,
          supplies: Math.floor(Math.random() * 2000) + 500
        },
        metrics: {
          ordersCount: Math.floor(Math.random() * 10) + 1,
          newClients: Math.floor(Math.random() * 3),
          completedOrders: Math.floor(Math.random() * 8) + 1
        },
        notes: i === 0 ? 'يوم عمل نشيط' : ''
      });
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${sampleUsers.length}`);
    console.log(`   Companies: ${sampleCompanies.length}`);
    console.log(`   Orders: ${sampleOrders.length}`);
    console.log(`   Company Documents: ${sampleCompanyDocs.length}`);
    console.log(`   Daily Finance Records: 7`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/glagol_pro', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
