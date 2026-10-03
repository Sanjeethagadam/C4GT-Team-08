const mongoose = require('mongoose');

const backlogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  academicSemesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  branchCode: {
    type: String,
    required: true,
  },
  sourceStagingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StagingBacklog'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLEARED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

backlogSchema.index({ studentId: 1, subjectId: 1, academicSemesterId: 1 }, { unique: true });

module.exports = mongoose.model('Backlog', backlogSchema);
