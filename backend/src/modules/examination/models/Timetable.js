const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  examinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examination',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  examDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  }
}, { timestamps: true });

timetableSchema.index({ examinationId: 1, subjectId: 1, branchId: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
