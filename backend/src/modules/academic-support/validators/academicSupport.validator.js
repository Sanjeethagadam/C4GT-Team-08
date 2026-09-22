const { body } = require('express-validator');

// Validation helper to check if startTime < endTime
const timeValidation = (value, { req }) => {
  if (value && req.body.endTime) {
    if (value >= req.body.endTime) {
      throw new Error('Start time must be before end time');
    }
  }
  return true;
};

exports.remedialValidator = [
  body('date').notEmpty().withMessage('Valid date is required').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Valid start time (HH:MM) is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time (HH:MM) is required').custom(timeValidation),
  body('endTime').notEmpty().withMessage('Valid end time (HH:MM) is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time (HH:MM) is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('facultyName').notEmpty().withMessage('Faculty name is required'),
  body('status').optional().isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('targetYear').optional().custom((value) => {
    if (Array.isArray(value)) {
      if (!value.every(v => Number.isInteger(Number(v)))) throw new Error('All target years must be integers');
    } else if (!Number.isInteger(Number(value))) {
      throw new Error('Target year must be an integer');
    }
    return true;
  }),
  body('targetSemester').optional({ checkFalsy: true }).isInt().withMessage('Target semester must be an integer'),
  body('targetSection').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid target section ID'),
  body('eligibleStudentIds').optional().isArray().withMessage('Eligible student IDs must be an array')
];

exports.guestLectureValidator = [
  body('date').notEmpty().withMessage('Valid date is required').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Valid start time (HH:MM) is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time (HH:MM) is required').custom(timeValidation),
  body('endTime').notEmpty().withMessage('Valid end time (HH:MM) is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time (HH:MM) is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('speakerName').notEmpty().withMessage('Speaker name is required'),
  body('status').optional().isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('targetBranches').optional().isArray().withMessage('Target branches must be an array'),
  body('targetYear').optional().custom((value) => {
    if (Array.isArray(value)) {
      if (!value.every(v => Number.isInteger(Number(v)))) throw new Error('All target years must be integers');
    } else if (!Number.isInteger(Number(value))) {
      throw new Error('Target year must be an integer');
    }
    return true;
  }),
  body('targetSemester').optional({ checkFalsy: true }).isInt().withMessage('Target semester must be an integer'),
  body('targetSection').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid target section ID'),
  body('eligibleStudentIds').optional().isArray().withMessage('Eligible student IDs must be an array')
];
