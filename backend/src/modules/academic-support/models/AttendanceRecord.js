const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  attendanceSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  present: { type: Boolean, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate attendance records for the same student in the same session
attendanceRecordSchema.index({ attendanceSessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
