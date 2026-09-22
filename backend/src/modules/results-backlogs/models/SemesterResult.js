const mongoose = require('mongoose');

const semesterResultSchema = new mongoose.Schema({
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
  internalMarks: {
    type: String, // String to preserve exactly like "-4" or "AB"
  },
  externalMarks: {
    type: String,
  },
  totalMarks: {
    type: String,
  },
  grade: {
    type: String,
  },
  credits: {
    type: Number,
  },
  result: {
    type: String, // e.g., "P", "F", "AB"
  },
  passed: {
    type: Boolean,
  },
  importMetadata: {
    importedAt: {
      type: Date,
      default: Date.now
    },
    fileName: String,
    parserVersion: String
  }
}, { timestamps: true });

// Idempotent constraint: one result per student, subject, semester
semesterResultSchema.index({ studentId: 1, subjectId: 1, academicSemesterId: 1 }, { unique: true });

module.exports = mongoose.model('SemesterResult', semesterResultSchema);
