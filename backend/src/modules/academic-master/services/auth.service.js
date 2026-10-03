const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static async login(username, password) {
    if (!username || !password) {
      throw new Error('Invalid credentials');
    }

    const cleanUsername = username.trim();
    // Case-insensitive lookup for username or email
    const escaped = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${escaped}$`, 'i') } },
        { email: { $regex: new RegExp(`^${escaped}$`, 'i') } }
      ]
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'PENDING') {
      throw new Error('Your account is pending administrator approval.');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new Error('User account is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || '');
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Resolve CTPO assignment if scope is missing on the user record
    let scopeRef = user.scopeRef;
    let scope = user.scope;

    if (user.role === 'CTPO' && (!scope || !scope.branchId)) {
      try {
        const CtpoAssignment = require('../../examination/models/CtpoAssignment');
        const assignment = await CtpoAssignment.findOne({
          ctpoUserId: user._id,
          status: 'ACTIVE'
        }).populate('semesterId');
        if (assignment) {
          scopeRef = { type: 'Branch', refId: assignment.branchId };
          scope = {
            year: assignment.semesterId?.year || 4,
            branchId: assignment.branchId
          };
        }
      } catch (err) {
        console.error('Error resolving CTPO assignment during login:', err.message);
      }
    }

    const payload = {
      id: user._id,
      role: user.role,
      scopeRef,
      scope,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarFileId: user.avatarFileId,
        avatar: user.avatar,
        scopeRef,
        scope,
      }
    };
  }
}

module.exports = AuthService;
