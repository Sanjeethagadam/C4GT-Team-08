const mongoose = require('mongoose');

const campusBranchAvailabilitySchema = new mongoose.Schema({
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

campusBranchAvailabilitySchema.index({ campusId: 1, branchId: 1 }, { unique: true });

module.exports = mongoose.model('CampusBranchAvailability', campusBranchAvailabilitySchema);
