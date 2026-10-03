const mongoose = require('mongoose');

const stagingBacklogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  htno: { type: String, required: true },
  studentName: { type: String, required: true },
  campusCode: { type: String, required: true },
  branchCode: { type: String, required: true },
  
  sourceWorkbook: { type: String, required: true },
  sourceSheet: { type: String, required: true },
  sourceRowNumber: { type: Number, required: true },
  
  academicSemesterCode: { type: String, required: true },
  academicSemesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  
  rawSubjectValue: { type: String, required: true },
  parsedSubjectCodes: { type: [String], required: true },
  semesterParsedSubjectCount: { type: Number, required: true },
  
  reportedBacklogCount: { type: Number, required: true },
  totalParsedSubjectCount: { type: Number, required: true },
  countMismatch: { type: Number, required: true },
  
  status: { type: String, default: 'PENDING_SUBJECT_MASTER' },
  importedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure idempotency index
stagingBacklogSchema.index({ studentId: 1, academicSemesterCode: 1, sourceWorkbook: 1, sourceSheet: 1 }, { unique: true });

module.exports = mongoose.model('StagingBacklog', stagingBacklogSchema);
