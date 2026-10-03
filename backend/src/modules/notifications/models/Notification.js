const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRole: {
    type: String,
    enum: ['STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR', 'ADMIN'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  notificationType: {
    type: String,
    enum: ['BACKLOG', 'REMEDIAL', 'GUEST_LECTURE', 'RISK', 'RESULT_IMPORT', 'SYSTEM'],
    required: true
  },
  referenceType: {
    type: String,
    enum: ['SemesterResult', 'RemedialClass', 'GuestLecture', 'RiskProfile', 'Backlog', 'Notice', 'None'],
    default: 'None'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can point to various collections based on referenceType
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient querying by recipient and read status
notificationSchema.index({ recipientUserId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
