const Student = require('../models/Student');
const CampusBranchAvailability = require('../models/CampusBranchAvailability');

const validateStudentConstraints = async (data) => {
  const availability = await CampusBranchAvailability.findOne({
    campusId: data.campusId,
    branchId: data.branchId
  });

  if (!availability || !availability.isAvailable) {
    throw new Error('The selected Campus and Branch combination is not available.');
  }
};

exports.create = async (data) => {
  await validateStudentConstraints(data);
  const item = new Student(data);
  return await item.save();
};

exports.findAll = async (filter = {}) => {
  return await Student.find(filter);
};

exports.findById = async (id) => {
  return await Student.findById(id);
};

exports.update = async (id, data) => {
  if (data.campusId && data.branchId) {
    await validateStudentConstraints(data);
  }
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Student.findByIdAndDelete(id);
};
