const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.examinationValidation = [
  body('semesterId').isMongoId().withMessage('Valid semesterId is required'),
  body('examinationType').isIn(['MID_1', 'MID_2', 'SEMESTER']).withMessage('Valid examinationType is required'),
  body('maxMarks').isNumeric().withMessage('maxMarks must be a number'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  validate
];
