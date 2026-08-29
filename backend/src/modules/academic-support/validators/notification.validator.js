const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');
exports.notificationValidation = [
  body('recipientStudentId').isMongoId(),
  body('notificationType').isIn(['BACKLOG', 'REMEDIAL', 'GUEST_LECTURE']),
  body('message').isString().notEmpty(),
  body('referenceId').isMongoId(),
  validate
];
