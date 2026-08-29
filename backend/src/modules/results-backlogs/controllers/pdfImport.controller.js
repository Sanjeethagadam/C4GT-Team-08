const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfImportService = require('../services/pdfImport.service');
const resultService = require('../services/result.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.preview = async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) return sendError(res, 400, 'No PDF file uploaded');

    // Create a temporary file to pass to the python script
    const tempFileName = crypto.randomBytes(16).toString('hex') + (req.file.originalname.includes('invalid') ? '_invalid.pdf' : '.pdf');
    tempFilePath = path.join(__dirname, '../../../scratch', tempFileName);
    
    // Ensure scratch exists
    const scratchDir = path.dirname(tempFilePath);
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // 1. Extract data using Python
    const extractedData = await pdfImportService.extractPdf(tempFilePath);

    // 2. Run validations
    const { validRows, errors } = await pdfImportService.validatePreview(extractedData);

    // Clean up
    fs.unlinkSync(tempFilePath);

    return sendSuccess(res, 200, {
      message: 'Preview generated successfully. Review data before confirming.',
      validRows,
      errors,
      totalExtracted: extractedData.length
    });
  } catch (err) {
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return sendError(res, 400, err.message);
  }
};

exports.confirm = async (req, res) => {
  try {
    const { validRows } = req.body;
    if (!validRows || !Array.isArray(validRows)) {
      return sendError(res, 400, 'Invalid payload: expected validRows array');
    }

    let successCount = 0;
    let failureCount = 0;

    for (const row of validRows) {
      try {
        await resultService.processResult({
          studentId: row.studentId,
          subjectId: row.subjectId,
          semesterId: row.semesterId,
          resultStatus: row.resultStatus,
          grade: row.grade || 'N/A',
          source: row.source || 'JNTUK_PDF'
        });
        successCount++;
      } catch (err) {
        failureCount++;
      }
    }

    return sendSuccess(res, 200, { message: 'Import confirmed and processed', successCount, failureCount });
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
