const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.riskProfileValidation = [
  body('studentId').isMongoId().withMessage('Valid studentId is required'),
  body('riskLevel').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('indicators').optional().isArray(),
  validate
];
