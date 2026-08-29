const mongoose = require('mongoose');
const { auditPlugin } = require('../../../middlewares/auditContext');

const riskThresholdSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true }
}, { timestamps: true });

riskThresholdSchema.plugin(auditPlugin, { resourceType: 'RiskThreshold' });

module.exports = mongoose.model('RiskThreshold', riskThresholdSchema);
