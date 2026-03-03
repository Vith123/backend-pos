const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Income title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['sales', 'refund_reversal', 'investment', 'loan', 'other'],
    default: 'other'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'other'],
    default: 'cash'
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Income', incomeSchema);
