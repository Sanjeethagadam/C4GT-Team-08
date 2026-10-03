const { sendError } = require('../utils/response.util');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 'Not authorized, role missing', 403);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Not authorized to access this route', 403);
    }

    next();
  };
};

module.exports = { requireRole };
