const { body } = require('express-validator');

const mappingValidator = [
  body('subjectId').isMongoId().withMessage('Valid Subject ID is required'),
  body('branchId').isMongoId().withMessage('Valid Branch ID is required'),
  body('semesterId').isMongoId().withMessage('Valid Semester ID is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

module.exports = { mappingValidator };
