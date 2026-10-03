const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { body } = require('express-validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

const studentValidator = [
  body('rollNo').notEmpty().withMessage('Roll number is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('campusId').isMongoId().withMessage('Invalid campus ID'),
  body('branchId').isMongoId().withMessage('Invalid branch ID'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('semesterId').isMongoId().withMessage('Invalid semester ID'),
  body('sectionId').optional().isMongoId().withMessage('Invalid section ID'),
];

router.use(protect);

router.route('/')
  .get(requireRole('ADMIN', 'CTPO', 'PRINCIPAL', 'HOD'), studentController.getStudents)
  .post(requireRole('ADMIN'), studentValidator, studentController.createStudent);

router.route('/me')
  .get(requireRole('STUDENT'), studentController.getMe);

router.route('/:id')
  .get(requireRole('ADMIN', 'CTPO', 'HOD'), studentController.getStudentById)
  .patch(requireRole('ADMIN'), studentValidator, studentController.updateStudent)
  .delete(requireRole('ADMIN'), studentController.deleteStudent);

module.exports = router;
