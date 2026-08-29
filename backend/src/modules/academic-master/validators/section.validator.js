const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const sectionValidation = [
  body('branchId').isMongoId().withMessage('Valid Branch ID is required'),
  body('year').isInt().withMessage('Year must be an integer'),
  body('sectionName').notEmpty().withMessage('Section Name is required'),
  validate
];

module.exports = { sectionValidation };
