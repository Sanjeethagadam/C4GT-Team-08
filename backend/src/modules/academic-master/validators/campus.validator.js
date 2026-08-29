const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const campusValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  validate
];

module.exports = { campusValidation };
