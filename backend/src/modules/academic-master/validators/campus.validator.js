const { body } = require('express-validator');

const campusValidator = [
  body('name').notEmpty().withMessage('Campus name is required'),
  body('code').notEmpty().withMessage('Campus code is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

module.exports = { campusValidator };
