const Notification = require('../models/Notification');

exports.createNotification = async (recipientStudentId, notificationType, message, referenceId) => {
  const notification = new Notification({
    recipientStudentId,
    notificationType,
    message,
    referenceId
  });
  return await notification.save();
};

exports.create = async (data) => {
  const item = new Notification(data);
  return await item.save();
};

exports.findAll = async () => {
  return await Notification.find();
};

exports.findById = async (id) => {
  return await Notification.findById(id);
};

exports.update = async (id, data) => {
  return await Notification.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Notification.findByIdAndDelete(id);
};
