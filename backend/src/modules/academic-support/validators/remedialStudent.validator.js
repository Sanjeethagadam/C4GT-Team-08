const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');
exports.remedialStudentValidation = [
  body('remedialClassId').isMongoId(),
  body('studentId').isMongoId(),
  validate
];
