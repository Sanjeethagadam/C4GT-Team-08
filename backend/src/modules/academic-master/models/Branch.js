const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

branchSchema.index({ campusId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Branch', branchSchema);
