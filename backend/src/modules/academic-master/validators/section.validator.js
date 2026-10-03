const { body } = require('express-validator');

const sectionValidator = [
  body('branchId').isMongoId().withMessage('Valid Branch ID is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('sectionName').notEmpty().withMessage('Section name is required'),
];

module.exports = { sectionValidator };
