const User = require('../models/User');

exports.create = async (data) => {
  const item = new User(data);
  return await item.save();
};

exports.findAll = async () => {
  return await User.find();
};

exports.findById = async (id) => {
  return await User.findById(id);
};

exports.update = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await User.findByIdAndDelete(id);
};
