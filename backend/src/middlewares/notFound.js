const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  return sendError(res, 404, `Not Found - ${req.originalUrl}`);
};

module.exports = notFound;
