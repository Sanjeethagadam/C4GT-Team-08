const CampusBranchAvailability = require('../models/CampusBranchAvailability');

exports.create = async (data) => {
  const item = new CampusBranchAvailability(data);
  return await item.save();
};

exports.findAll = async () => {
  return await CampusBranchAvailability.find();
};

exports.findById = async (id) => {
  return await CampusBranchAvailability.findById(id);
};

exports.update = async (id, data) => {
  return await CampusBranchAvailability.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await CampusBranchAvailability.findByIdAndDelete(id);
};
