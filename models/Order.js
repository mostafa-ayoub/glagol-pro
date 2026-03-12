const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  orderRef: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: String,
    email: String,
    nationality: String,
    address: String
  },
  items: [{
    serviceId: {
      type: Number,
      required: true
    },
    serviceName: {
      ar: String,
      ru: String
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    translatorFee: {
      type: Number,
      default: 0,
      min: 0
    },
    notaryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    profit: {
      type: Number,
      default: 0
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
  staffId: {
    type: Number,
    ref: 'User'
  },
  workflow: {
    type: String,
    enum: ['new', 'translate', 'review', 'notary', 'ready', 'delivered', 'cancelled'],
    default: 'new'
  },
  status: {
    type: String,
    enum: ['new', 'partial', 'done', 'cancelled'],
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
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCosts = this.items.reduce((sum, item) => 
      sum + ((item.translatorFee + item.notaryFee) * item.quantity), 0);
    
    this.totals.subtotal = subtotal;
    this.totals.total = Math.max(0, subtotal - this.totals.discount);
    this.totals.remaining = Math.max(0, this.totals.total - this.totals.paid);
    
    // Calculate profit for each item
    this.items.forEach(item => {
      item.profit = item.price - item.translatorFee - item.notaryFee;
    });
  }
  
  this.updatedAt = Date.now();
  next();
});

// Generate order reference
orderSchema.pre('save', async function(next) {
  if (!this.orderRef) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.orderRef = `TR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
