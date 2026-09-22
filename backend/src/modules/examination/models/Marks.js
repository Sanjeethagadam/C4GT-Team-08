const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  examinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examination',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'MALPRACTICE'],
    required: true,
  },
  draft: {
    type: Boolean,
    default: true,
  },
  submittedAt: {
    type: Date,
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

marksSchema.index({ studentId: 1, examinationId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
