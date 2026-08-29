const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({
    success: true,
    data: data,
  });
};

const sendError = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
