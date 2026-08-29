const mongoose = require('mongoose');
const { auditPlugin } = require('../../../middlewares/auditContext');

const backlogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Result', required: true },
  status: { type: String, enum: ['ACTIVE', 'CLEARED'], default: 'ACTIVE' }
}, { timestamps: true });

backlogSchema.index({ studentId: 1, subjectId: 1, semesterId: 1 }, { unique: true });

backlogSchema.plugin(auditPlugin, { resourceType: 'Backlog' });

backlogSchema.index({ studentId: 1 });

module.exports = mongoose.model('Backlog', backlogSchema);
