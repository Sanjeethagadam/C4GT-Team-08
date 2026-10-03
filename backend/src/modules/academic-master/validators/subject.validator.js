const { body } = require('express-validator');

const subjectValidator = [
  body('subjectCode').notEmpty().withMessage('Subject code is required'),
  body('subjectName').notEmpty().withMessage('Subject name is required'),
  body('semesterId').isMongoId().withMessage('Valid Semester ID is required'),
];

module.exports = { subjectValidator };
