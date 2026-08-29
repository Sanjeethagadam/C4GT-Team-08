const importService = require('../services/import.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.importResults = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    const report = await importService.processImport(req.file.buffer);
    return sendSuccess(res, 200, report);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
