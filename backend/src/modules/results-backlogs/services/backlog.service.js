const Backlog = require('../models/Backlog');

exports.create = async (data) => {
  const item = new Backlog(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Backlog.find();
};

exports.findById = async (id) => {
  return await Backlog.findById(id);
};

exports.update = async (id, data) => {
  return await Backlog.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Backlog.findByIdAndDelete(id);
};
