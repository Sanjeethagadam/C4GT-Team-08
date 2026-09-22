const { body } = require('express-validator');

const semesterValidator = [
  body('academicYearId').isMongoId().withMessage('Valid Academic Year ID is required'),
  body('semesterCode').notEmpty().withMessage('Semester code is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

module.exports = { semesterValidator };
