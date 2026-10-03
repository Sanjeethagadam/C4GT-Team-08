const mongoose = require('mongoose');

const ctpoAssignmentSchema = new mongoose.Schema({
  ctpoUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
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
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  studentCategory: {
    type: String,
    enum: ['DAY_SCHOLAR', 'HOSTELLER'],
    required: false, // can be optional if assignment applies to whole class
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

// Create a partial index ensuring only one ACTIVE assignment for a given scope
ctpoAssignmentSchema.index(
  { campusId: 1, branchId: 1, academicYearId: 1, semesterId: 1, sectionId: 1, studentCategory: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

module.exports = mongoose.model('CtpoAssignment', ctpoAssignmentSchema);
