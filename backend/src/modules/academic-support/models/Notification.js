const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  notificationType: { type: String, enum: ['BACKLOG', 'REMEDIAL', 'GUEST_LECTURE'], required: true },
  message: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['UNREAD', 'READ'], default: 'UNREAD' }
}, { timestamps: true });

notificationSchema.index({ recipientStudentId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
