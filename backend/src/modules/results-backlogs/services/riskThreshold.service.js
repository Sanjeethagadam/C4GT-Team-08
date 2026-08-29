const RiskThreshold = require('../models/RiskThreshold');

exports.create = async (data) => {
  const item = new RiskThreshold(data);
  return await item.save();
};

exports.findAll = async () => {
  return await RiskThreshold.find();
};

exports.findById = async (id) => {
  return await RiskThreshold.findById(id);
};

exports.update = async (id, data) => {
  return await RiskThreshold.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await RiskThreshold.findByIdAndDelete(id);
};
