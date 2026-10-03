const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  examType: {
    type: String,
    enum: ['MID1', 'MID2', 'SEMESTER'],
    required: true,
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED'],
    default: 'SCHEDULED'
  }
}, { timestamps: true });

examinationSchema.index({ examType: 1, academicYearId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('Examination', examinationSchema);
