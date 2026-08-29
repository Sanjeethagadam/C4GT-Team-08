const mongoose = require('mongoose');

const remedialClassSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  year: { type: Number, required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: { type: String, required: true },
  venue: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RemedialClass', remedialClassSchema);
