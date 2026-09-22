const mongoose = require('mongoose');

const riskConfigSchema = new mongoose.Schema({
  indicator: {
    type: String,
    enum: ['BACKLOGS', 'INTERNAL_MARKS'],
    required: true,
    unique: true
  },
  thresholds: {
    LOW: { type: Number },
    MEDIUM: { type: Number },
    HIGH: { type: Number },
    CRITICAL: { type: Number }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('RiskConfig', riskConfigSchema);
