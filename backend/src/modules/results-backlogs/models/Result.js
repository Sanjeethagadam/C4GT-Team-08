const mongoose = require('mongoose');
const { auditPlugin } = require('../../../middlewares/auditContext');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  resultStatus: { type: String, enum: ['PASS', 'FAIL'], required: true },
  grade: { type: String, required: true },
  source: { type: String, required: true }
}, { timestamps: true });

resultSchema.index({ studentId: 1, subjectId: 1, semesterId: 1 }, { unique: true });

resultSchema.plugin(auditPlugin, { resourceType: 'Result' });

resultSchema.index({ studentId: 1 });

module.exports = mongoose.model('Result', resultSchema);
