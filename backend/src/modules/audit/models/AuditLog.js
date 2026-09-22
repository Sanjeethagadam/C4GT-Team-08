const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: [
      'MARK_CREATED',
      'MARK_EDITED',
      'MARK_SUBMITTED',
      'MARK_RESUBMITTED',
      'NOTICE_UPLOADED',
      'NOTICE_EDITED',
      'NOTICE_PUBLISHED',
      'NOTICE_UNPUBLISHED',
      'NOTICE_DELETED',
      'EXPORT_GENERATED',
      'BACKLOG_CLEARED',
      'BACKLOG_MANUALLY_UPDATED'
    ],
    required: true
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  reason: {
    type: String
  },
  affectedStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  scope: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
