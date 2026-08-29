const Branch = require('../models/Branch');

exports.create = async (data) => {
  const item = new Branch(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Branch.find();
};

exports.findById = async (id) => {
  return await Branch.findById(id);
};

exports.update = async (id, data) => {
  return await Branch.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Branch.findByIdAndDelete(id);
};
