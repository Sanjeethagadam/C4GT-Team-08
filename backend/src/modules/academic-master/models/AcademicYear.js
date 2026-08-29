const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true }, // e.g. "2023-2024"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('AcademicYear', academicYearSchema);
