const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const academicYearValidation = [
  body('academicYear').notEmpty().withMessage('Academic Year is required'),
  body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
  body('endDate').isISO8601().toDate().withMessage('Valid end date is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  validate
];

module.exports = { academicYearValidation };
