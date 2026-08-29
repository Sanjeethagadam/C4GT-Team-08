const mongoose = require('mongoose');
const { auditPlugin } = require('../../../middlewares/auditContext');

const markSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Examination', required: true },
  marks: { type: Number, required: true },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

markSchema.index({ studentId: 1, subjectId: 1, examinationId: 1 }, { unique: true });

markSchema.plugin(auditPlugin, { resourceType: 'Mark' });

markSchema.index({ studentId: 1 });

module.exports = mongoose.model('Mark', markSchema);
