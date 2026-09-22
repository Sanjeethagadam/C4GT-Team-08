const mongoose = require('mongoose');

const subjectBranchMappingSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  }
}, { timestamps: true });

subjectBranchMappingSchema.index({ subjectId: 1, branchId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('SubjectBranchMapping', subjectBranchMappingSchema);
