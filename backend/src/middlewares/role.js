const { sendError } = require('../utils/response');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden. Insufficient permissions.');
    }
    next();
  };
};

module.exports = { authorizeRoles };
