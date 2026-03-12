const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    ar: {
      type: String,
      required: true
    },
    ru: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    enum: ['translation', 'notary', 'legal', 'other'],
    default: 'translation'
  },
  basePrice: {
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
  unit: {
    type: String,
    enum: ['page', 'document', 'hour', 'word'],
    default: 'document'
  },
  description: {
    ar: String,
    ru: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
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
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
