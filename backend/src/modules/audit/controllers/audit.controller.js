const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).populate('userId', 'username role');
    return sendSuccess(res, 200, logs);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
