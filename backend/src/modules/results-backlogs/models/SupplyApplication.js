const mongoose = require('mongoose');

const supplyApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  backlogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Backlog', required: true },
  applicationStatus: { type: String, enum: ['APPLIED', 'APPROVED', 'REJECTED'], default: 'APPLIED' },
  deadline: { type: Date, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' }
}, { timestamps: true });

supplyApplicationSchema.index({ studentId: 1 });

module.exports = mongoose.model('SupplyApplication', supplyApplicationSchema);
