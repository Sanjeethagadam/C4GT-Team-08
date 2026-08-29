const Section = require('../models/Section');

exports.create = async (data) => {
  const item = new Section(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Section.find();
};

exports.findById = async (id) => {
  return await Section.findById(id);
};

exports.update = async (id, data) => {
  return await Section.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Section.findByIdAndDelete(id);
};
