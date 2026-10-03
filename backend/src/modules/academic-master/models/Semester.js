const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  semesterCode: {
    type: String, // e.g., "1-1", "1-2"
    required: true,
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  }
}, { timestamps: true });

// Ensure unique semester code per academic year
semesterSchema.index({ academicYearId: 1, semesterCode: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
