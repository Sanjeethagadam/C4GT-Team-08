const Mark = require('../models/Mark');

exports.create = async (data) => {
  const item = new Mark(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Mark.find();
};

exports.findById = async (id) => {
  return await Mark.findById(id);
};

exports.update = async (id, data) => {
  return await Mark.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Mark.findByIdAndDelete(id);
};
