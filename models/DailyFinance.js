const mongoose = require('mongoose');

const dailyFinanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  income: {
    orders: {
      type: Number,
      default: 0
    },
    companyDocs: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  expenses: {
    salaries: {
      type: Number,
      default: 0
    },
    rent: {
      type: Number,
      default: 0
    },
    utilities: {
      type: Number,
      default: 0
    },
    supplies: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  profit: {
    gross: {
      type: Number,
      default: 0
    },
    net: {
      type: Number,
      default: 0
    }
  },
  metrics: {
    ordersCount: {
      type: Number,
      default: 0
    },
    newClients: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    },
    avgOrderValue: {
      type: Number,
      default: 0
    }
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

// Calculate totals before saving
dailyFinanceSchema.pre('save', function(next) {
  this.income.total = this.income.orders + this.income.companyDocs + this.income.other;
  this.expenses.total = this.expenses.salaries + this.expenses.rent + 
                     this.expenses.utilities + this.expenses.supplies + this.expenses.other;
  this.profit.gross = this.income.total - this.expenses.total;
  this.profit.net = this.profit.gross; // Can be adjusted for taxes later
  
  if (this.metrics.ordersCount > 0) {
    this.metrics.avgOrderValue = this.income.orders / this.metrics.ordersCount;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DailyFinance', dailyFinanceSchema);
