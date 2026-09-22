const mongoose = require('mongoose');

const remedialClassSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  customSubjectName: { type: String }, // For manual entry if subject is not in Subject Master
  topic: { type: String, required: true },
  facultyName: { type: String, required: true },
  targetYear: { type: Number },
  targetSemester: { type: Number },
  targetSection: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  eligibleStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('RemedialClass', remedialClassSchema);
