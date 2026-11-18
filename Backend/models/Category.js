const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  defaultUrgencyWeight: {
    type: Number,
    default: 20
  },
  icon: {
    type: String,
    default: 'HelpCircle'
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
