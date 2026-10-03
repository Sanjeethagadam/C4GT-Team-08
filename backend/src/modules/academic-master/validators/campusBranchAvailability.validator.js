const { body } = require('express-validator');

const availabilityValidator = [
  body('campusId').isMongoId().withMessage('Valid Campus ID is required'),
  body('branchId').isMongoId().withMessage('Valid Branch ID is required'),
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
];

module.exports = { availabilityValidator };
