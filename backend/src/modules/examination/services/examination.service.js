const Examination = require('../models/Examination');

exports.create = async (data) => {
  const item = new Examination(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Examination.find();
};

exports.findById = async (id) => {
  return await Examination.findById(id);
};

exports.update = async (id, data) => {
  return await Examination.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Examination.findByIdAndDelete(id);
};
