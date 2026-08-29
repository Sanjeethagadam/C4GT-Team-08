const Timetable = require('../models/Timetable');

exports.create = async (data) => {
  const item = new Timetable(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Timetable.find();
};

exports.findById = async (id) => {
  return await Timetable.findById(id);
};

exports.update = async (id, data) => {
  return await Timetable.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Timetable.findByIdAndDelete(id);
};
