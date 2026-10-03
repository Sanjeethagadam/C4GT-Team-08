const express = require('express');
const router = express.Router();
const guestLectureController = require('../controllers/guestLecture.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');
const { guestLectureValidator } = require('../validators/academicSupport.validator');
const { validateRequest } = require('../../../middlewares/validate.middleware');

router.use(protect);
router.get('/target-students', requireRole('COORDINATOR', 'ADMIN'), guestLectureController.getTargetStudents);
router.get('/student', requireRole('STUDENT'), guestLectureController.getForStudent);
router.get('/', requireRole('COORDINATOR', 'HOD', 'PRINCIPAL', 'ADMIN', 'STUDENT'), guestLectureController.getAll);
router.post('/', requireRole('COORDINATOR', 'ADMIN'), guestLectureValidator, validateRequest, guestLectureController.create);
router.put('/:id', requireRole('COORDINATOR', 'ADMIN'), guestLectureValidator, validateRequest, guestLectureController.update);
router.delete('/:id', requireRole('COORDINATOR', 'ADMIN'), guestLectureController.delete);

module.exports = router;
