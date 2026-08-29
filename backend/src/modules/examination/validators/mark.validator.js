const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.markValidation = [
  body('studentId').isMongoId().withMessage('Valid studentId is required'),
  body('subjectId').isMongoId().withMessage('Valid subjectId is required'),
  body('examinationId').isMongoId().withMessage('Valid examinationId is required'),
  body('marks').isNumeric().withMessage('marks must be a number'),
  validate
];
