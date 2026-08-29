const AcademicYear = require('../models/AcademicYear');

exports.create = async (data) => {
  const item = new AcademicYear(data);
  return await item.save();
};

exports.findAll = async () => {
  return await AcademicYear.find();
};

exports.findById = async (id) => {
  return await AcademicYear.findById(id);
};

exports.update = async (id, data) => {
  return await AcademicYear.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await AcademicYear.findByIdAndDelete(id);
};
