const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.supplyApplicationValidation = [
  body('studentId').isMongoId().withMessage('Valid studentId is required'),
  body('backlogId').isMongoId().withMessage('Valid backlogId is required'),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('applicationStatus').optional().isIn(['APPLIED', 'APPROVED', 'REJECTED']),
  body('paymentStatus').optional().isIn(['PENDING', 'PAID']),
  validate
];
