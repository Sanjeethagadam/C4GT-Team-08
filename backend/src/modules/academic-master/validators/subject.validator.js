const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const subjectValidation = [
  body('subjectCode').notEmpty().withMessage('Subject Code is required'),
  body('subjectName').notEmpty().withMessage('Subject Name is required'),
  body('semesterId').isMongoId().withMessage('Valid Semester ID is required'),
  validate
];

module.exports = { subjectValidation };
