const { sendError } = require('../utils/response');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Internal Server Error';
  const errors = env.nodeEnv === 'development' ? [err.stack] : [];

  return sendError(res, statusCode, message, errors);
};

module.exports = errorHandler;
