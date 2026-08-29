const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded; // { id, role, scope }
    
    // Bind to audit context for Mongoose hooks
    const store = require('./auditContext').auditContext.getStore();
    if (store) {
      store.set('user', decoded);
    }

    next();
  } catch (ex) {
    return sendError(res, 401, 'Invalid token.');
  }
};

module.exports = authMiddleware;
