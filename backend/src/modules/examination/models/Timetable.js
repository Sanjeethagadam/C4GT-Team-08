const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  examinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Examination', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g., '10:00 AM'
  endTime: { type: String, required: true },
  venue: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
