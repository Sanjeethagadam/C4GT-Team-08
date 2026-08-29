const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  examinationType: { type: String, enum: ['MID_1', 'MID_2', 'SEMESTER'], required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  maxMarks: { type: Number, required: true }
}, { timestamps: true });

examinationSchema.index({ semesterId: 1 });

module.exports = mongoose.model('Examination', examinationSchema);
