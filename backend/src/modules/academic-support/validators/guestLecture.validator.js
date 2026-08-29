const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');
exports.guestLectureValidation = [
  body('lecturerName').isString().notEmpty(),
  body('campusId').isMongoId(),
  body('schedule').isString().notEmpty(),
  validate
];
