const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const env = require('../../../config/env');
const { sendSuccess, sendError } = require('../../../utils/response');

const generateTokens = async (user) => {
  const payload = { id: user._id, role: user.role, scope: user.scope || {} };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiry });
  
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const salt = await bcrypt.genSalt(10);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  
  user.refreshTokenHash = refreshTokenHash;
  await user.save();
  
  return { token, refreshToken, user: payload };
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return sendError(res, 400, 'Username and password are required');

    const user = await User.findOne({ username, status: 'ACTIVE' });
    if (!user) return sendError(res, 401, 'Invalid credentials');

    // Check lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return sendError(res, 403, 'Account locked due to too many failed attempts. Try again later.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + env.lockoutDurationMs);
      }
      await user.save();
      return sendError(res, 401, 'Invalid credentials');
    }

    // Reset on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    
    const tokens = await generateTokens(user);
    return sendSuccess(res, 200, tokens);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

exports.refresh = async (req, res) => {
  try {
    const { username, refreshToken } = req.body;
    if (!username || !refreshToken) return sendError(res, 400, 'Username and refreshToken are required');

    const user = await User.findOne({ username, status: 'ACTIVE' });
    if (!user || !user.refreshTokenHash) return sendError(res, 401, 'Invalid token');

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) return sendError(res, 401, 'Invalid token');

    const tokens = await generateTokens(user);
    return sendSuccess(res, 200, tokens);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return sendError(res, 400, 'Username is required');

    await User.findOneAndUpdate({ username }, { refreshTokenHash: null });
    return sendSuccess(res, 200, { message: 'Logged out successfully' });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
