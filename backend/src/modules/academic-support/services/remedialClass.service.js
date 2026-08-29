const RemedialClass = require('../models/RemedialClass');

exports.create = async (data) => {
  const item = new RemedialClass(data);
  return await item.save();
};

exports.findAll = async () => {
  return await RemedialClass.find();
};

exports.findById = async (id) => {
  return await RemedialClass.findById(id);
};

exports.update = async (id, data) => {
  return await RemedialClass.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await RemedialClass.findByIdAndDelete(id);
};
