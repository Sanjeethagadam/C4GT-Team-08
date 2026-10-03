const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  sectionName: {
    type: String, // e.g., "A", "B"
    required: true,
  }
}, { timestamps: true });

sectionSchema.index({ branchId: 1, year: 1, sectionName: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
