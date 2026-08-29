const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

const userValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR', 'ADMIN']).withMessage('Invalid role'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  validate
];

module.exports = { userValidation };
