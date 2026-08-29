const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.backlogValidation = [
  body('studentId').isMongoId().withMessage('Valid studentId is required'),
  body('subjectId').isMongoId().withMessage('Valid subjectId is required'),
  body('semesterId').isMongoId().withMessage('Valid semesterId is required'),
  body('resultId').isMongoId().withMessage('Valid resultId is required'),
  body('status').optional().isIn(['ACTIVE', 'CLEARED']),
  validate
];
