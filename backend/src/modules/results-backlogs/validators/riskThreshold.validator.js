const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.riskThresholdValidation = [
  body('key').isString().notEmpty().withMessage('Key is required'),
  body('value').isNumeric().withMessage('Value is required'),
  body('description').optional().isString(),
  validate
];
