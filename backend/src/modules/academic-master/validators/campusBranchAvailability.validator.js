const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const campusBranchAvailabilityValidation = [
  body('campusId').isMongoId().withMessage('Valid Campus ID is required'),
  body('branchId').isMongoId().withMessage('Valid Branch ID is required'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
  validate
];

module.exports = { campusBranchAvailabilityValidation };
