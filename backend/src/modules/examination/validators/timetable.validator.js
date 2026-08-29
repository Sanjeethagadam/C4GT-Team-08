const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.timetableValidation = [
  body('examinationId').isMongoId().withMessage('Valid examinationId is required'),
  body('subjectId').isMongoId().withMessage('Valid subjectId is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').isString().notEmpty(),
  body('endTime').isString().notEmpty(),
  body('venue').optional().isString(),
  validate
];
