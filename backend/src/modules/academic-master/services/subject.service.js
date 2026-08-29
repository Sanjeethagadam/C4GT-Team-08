const Subject = require('../models/Subject');

exports.create = async (data) => {
  const item = new Subject(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Subject.find();
};

exports.findById = async (id) => {
  return await Subject.findById(id);
};

exports.update = async (id, data) => {
  return await Subject.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Subject.findByIdAndDelete(id);
};
