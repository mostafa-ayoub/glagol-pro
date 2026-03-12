const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  representative: {
    name: String,
    phone: String,
    email: String
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  contractDetails: {
    startDate: Date,
    endDate: Date,
    terms: String,
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  financial: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    totalDebt: {
      type: Number,
      default: 0
    },
    creditLimit: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate debt
companySchema.methods.calculateDebt = function() {
  this.financial.totalDebt = Math.max(0, this.financial.totalRevenue - this.financial.totalPaid);
  return this.financial.totalDebt;
};

module.exports = mongoose.model('Company', companySchema);
