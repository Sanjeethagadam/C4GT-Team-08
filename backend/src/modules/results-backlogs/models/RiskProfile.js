const mongoose = require('mongoose');

const riskProfileSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  indicators: [{ type: String }]
}, { timestamps: true });


module.exports = mongoose.model('RiskProfile', riskProfileSchema);
