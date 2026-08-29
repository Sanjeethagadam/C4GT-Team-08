const Semester = require('../models/Semester');

exports.create = async (data) => {
  const item = new Semester(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Semester.find();
};

exports.findById = async (id) => {
  return await Semester.findById(id);
};

exports.update = async (id, data) => {
  return await Semester.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Semester.findByIdAndDelete(id);
};
