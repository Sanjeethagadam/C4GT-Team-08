const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  referenceType: { type: String, enum: ['RemedialClass', 'GuestLecture'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  targetStudentCount: { type: Number, required: true },
  attendanceSubmitted: { type: Boolean, default: false },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
