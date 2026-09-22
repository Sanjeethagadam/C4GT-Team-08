const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  location: {
    type: String,
    default: 'KORANGI'
  }
}, { timestamps: true });

module.exports = mongoose.model('Campus', campusSchema);
