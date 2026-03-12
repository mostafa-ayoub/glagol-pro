const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  office: {
    name: {
      type: String,
      default: 'ГЛАГОЛ PRO'
    },
    address: {
      type: String,
      default: 'موسكو، جامعة РУДН'
    },
    phone: {
      type: String,
      default: '+7 495 123-45-67'
    },
    email: {
      type: String,
      default: 'info@glagol.pro'
    },
    website: {
      type: String,
      default: 'www.glagol.pro'
    }
  },
  passwords: {
    admin: {
      type: String,
      default: 'admin123'
    },
    reception: {
      type: String,
      default: 'recep123'
    },
    staff: {
      type: String,
      default: 'staff123'
    }
  },
  financial: {
    currency: {
      type: String,
      default: 'RUB'
    },
    taxRate: {
      type: Number,
      default: 0
    },
    defaultDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  workflow: {
    autoAdvance: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['ar', 'ru', 'en'],
      default: 'ar'
    },
    accentColor: {
      type: String,
      default: '#1e40af'
    }
  },
  backup: {
    enabled: {
      type: Boolean,
      default: true
    },
    schedule: {
      type: String,
      default: '0 2 * * *'
    },
    retention: {
      type: Number,
      default: 30
    }
  },
  security: {
    sessionTimeout: {
      type: Number,
      default: 3600
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 900
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
