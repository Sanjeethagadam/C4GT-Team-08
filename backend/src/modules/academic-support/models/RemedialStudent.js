const mongoose = require('mongoose');

const remedialStudentSchema = new mongoose.Schema({
  remedialClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'RemedialClass', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  attendanceStatus: { type: String, enum: ['PRESENT', 'ABSENT', 'PENDING'], default: 'PENDING' },
  progress: { type: String }
}, { timestamps: true });

// A student should only be assigned once per remedial class
remedialStudentSchema.index({ remedialClassId: 1, studentId: 1 }, { unique: true });

remedialStudentSchema.index({ studentId: 1 });

module.exports = mongoose.model('RemedialStudent', remedialStudentSchema);
