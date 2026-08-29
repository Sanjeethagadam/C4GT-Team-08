const SupplyApplication = require('../models/SupplyApplication');

exports.create = async (data) => {
  const item = new SupplyApplication(data);
  return await item.save();
};

exports.findAll = async () => {
  return await SupplyApplication.find();
};

exports.findById = async (id) => {
  return await SupplyApplication.findById(id);
};

exports.update = async (id, data) => {
  return await SupplyApplication.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await SupplyApplication.findByIdAndDelete(id);
};
