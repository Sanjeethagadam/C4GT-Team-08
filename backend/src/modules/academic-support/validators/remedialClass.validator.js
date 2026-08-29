const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');
exports.remedialClassValidation = [
  body('subjectId').isMongoId(),
  body('campusId').isMongoId(),
  body('branchId').isMongoId(),
  body('year').isNumeric(),
  body('coordinatorId').isMongoId(),
  body('schedule').isString().notEmpty(),
  validate
];
