const { body } = require('express-validator');

const academicYearValidator = [
  body('academicYear').notEmpty().withMessage('Academic year string is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

module.exports = { academicYearValidator };
