const Campus = require('../models/Campus');

exports.create = async (data) => {
  const item = new Campus(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Campus.find();
};

exports.findById = async (id) => {
  return await Campus.findById(id);
};

exports.update = async (id, data) => {
  return await Campus.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Campus.findByIdAndDelete(id);
};
