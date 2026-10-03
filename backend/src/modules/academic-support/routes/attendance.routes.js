const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.get('/progress/all', requireRole('COORDINATOR', 'HOD', 'ADMIN', 'PRINCIPAL'), attendanceController.getAllProgress);
router.get('/history/:studentId', requireRole('COORDINATOR', 'HOD', 'ADMIN', 'PRINCIPAL', 'STUDENT'), attendanceController.getStudentHistory);
router.get('/:referenceId', requireRole('COORDINATOR', 'HOD', 'ADMIN', 'PRINCIPAL'), attendanceController.getAttendanceSession);
router.put('/:referenceId', requireRole('COORDINATOR', 'HOD', 'ADMIN', 'PRINCIPAL'), attendanceController.submitAttendance);

module.exports = router;
