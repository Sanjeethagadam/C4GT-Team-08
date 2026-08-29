const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const studentValidation = [
  body('rollNo').notEmpty().withMessage('Roll No is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('campusId').isMongoId().withMessage('Valid Campus ID is required'),
  body('branchId').isMongoId().withMessage('Valid Branch ID is required'),
  body('year').isInt().withMessage('Year must be an integer'),
  body('semesterId').isMongoId().withMessage('Valid Semester ID is required'),
  body('sectionId').isMongoId().withMessage('Valid Section ID is required'),
  validate
];

module.exports = { studentValidation };
