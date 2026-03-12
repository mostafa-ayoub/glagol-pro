const mongoose = require('mongoose');

const companyDocSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  companyId: {
    type: Number,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  documentType: {
    type: String,
    enum: ['contract', 'agreement', 'translation', 'certification', 'other'],
    default: 'translation'
  },
  items: [{
    serviceId: Number,
    serviceName: String,
    quantity: {
      type: Number,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paid: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['new', 'processing', 'completed', 'paid', 'cancelled'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  deadline: {
    type: Date
  },
  staffId: {
    type: Number,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  date: {
    type: Date,
    default: Date.now
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

// Calculate totals before saving
companyDocSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totals.subtotal = subtotal;
    this.totals.total = Math.max(0, subtotal - this.totals.discount);
    this.totals.remaining = Math.max(0, this.totals.total - this.totals.paid);
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CompanyDoc', companyDocSchema);
