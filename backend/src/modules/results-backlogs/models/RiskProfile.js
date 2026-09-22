const mongoose = require('mongoose');

const riskProfileSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicSemesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'NOT_CONFIGURED'],
    required: true
  },
  factors: [{
    type: String
  }]
}, { timestamps: true });

// A student has one risk profile per semester (e.g. at the end of the semester evaluation)
riskProfileSchema.index({ studentId: 1, academicSemesterId: 1 }, { unique: true });

module.exports = mongoose.model('RiskProfile', riskProfileSchema);
