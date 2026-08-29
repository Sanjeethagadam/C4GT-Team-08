const { validationResult, matchedData } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation Error', errors.array());
  }

  // Strict Validation: Reject unexpected extra fields in req.body
  const validData = matchedData(req, { locations: ['body'] });
  const rawBodyKeys = Object.keys(req.body);
  const validKeys = Object.keys(validData);

  const extraKeys = rawBodyKeys.filter(key => !validKeys.includes(key));
  if (extraKeys.length > 0) {
    return sendError(res, 400, `Validation Error: Unexpected fields detected: ${extraKeys.join(', ')}`);
  }

  // Strip anything that wasn't validated
  req.body = validData;
  next();
};

module.exports = validate;
