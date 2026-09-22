const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { email: { $type: 'string', $gt: '' } }
    }
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  avatar: {
    type: String, // Store base64 or URL (legacy)
    required: false,
  },
  avatarFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  role: {
    type: String,
    enum: ['STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR', 'ADMIN'],
    required: true,
  },
  scopeRef: {
    type: {
      type: String,
      enum: ['Campus', 'Branch', 'Student', null], // Can be null for ADMIN/PRINCIPAL
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'scopeRef.type',
    },
  },
  scope: {
    type: mongoose.Schema.Types.Mixed, // e.g. { year: 4, branchId: ... }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'ACTIVE',
  },
  lastActiveAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
