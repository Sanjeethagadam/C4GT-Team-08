const mongoose = require('mongoose');

const guestLectureSchema = new mongoose.Schema({
  lecturerName: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  year: { type: Number },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  schedule: { type: String, required: true },
  venue: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('GuestLecture', guestLectureSchema);
