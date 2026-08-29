const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const semesterValidation = [
  body('academicYearId').isMongoId().withMessage('Valid Academic Year ID is required'),
  body('semesterCode').notEmpty().withMessage('Semester Code is required'),
  body('year').isInt().withMessage('Year must be an integer'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  validate
];

module.exports = { semesterValidation };
