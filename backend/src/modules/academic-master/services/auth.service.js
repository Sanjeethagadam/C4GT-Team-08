const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static async login(username, password) {
    const user = await User.findOne({ username });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'PENDING') {
      throw new Error('Your account is pending administrator approval.');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new Error('User account is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      id: user._id,
      role: user.role,
      scopeRef: user.scopeRef,
      scope: user.scope,
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
        scopeRef: user.scopeRef,
        scope: user.scope,
      }
    };
  }
}

module.exports = AuthService;
