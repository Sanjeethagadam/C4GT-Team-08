const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.resultValidation = [
  body('studentId').isMongoId().withMessage('Valid studentId is required'),
  body('subjectId').isMongoId().withMessage('Valid subjectId is required'),
  body('semesterId').isMongoId().withMessage('Valid semesterId is required'),
  body('resultStatus').isIn(['PASS', 'FAIL', 'ABSENT']).withMessage('Valid resultStatus is required'),
  body('grade').isString().notEmpty(),
  body('source').isString().notEmpty(),
  validate
];
