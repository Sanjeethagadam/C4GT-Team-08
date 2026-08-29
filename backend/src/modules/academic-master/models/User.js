const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { auditPlugin } = require('../../../middlewares/auditContext');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR', 'ADMIN'],
    required: true 
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  scope: {
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
    campusIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campus' }],
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    year: { type: Number }
  },
  refreshTokenHash: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date }
}, { timestamps: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.plugin(auditPlugin, { resourceType: 'User' });

module.exports = mongoose.model('User', userSchema);
