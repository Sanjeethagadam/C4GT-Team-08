// Standard API Response Formatter
const sendSuccess = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const sendError = (res, message, status = 400, errors = []) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
