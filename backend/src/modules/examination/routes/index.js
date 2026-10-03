const express = require('express');
const router = express.Router();

const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

const examinationController = require('../controllers/examination.controller');
const timetableController = require('../controllers/timetable.controller');
const marksController = require('../controllers/marks.controller');
const ctpoAssignmentController = require('../controllers/ctpoAssignment.controller');

// CtpoAssignments
router.post('/ctpo-assignments', protect, requireRole('ADMIN', 'HOD'), ctpoAssignmentController.createAssignment);
router.get('/ctpo-assignments', protect, requireRole('ADMIN', 'HOD', 'CTPO'), ctpoAssignmentController.getAssignments);
router.post('/ctpo-assignments/reassign', protect, requireRole('ADMIN', 'HOD'), ctpoAssignmentController.reassignAssignment);

// Examinations
router.post('/events', protect, requireRole('ADMIN', 'CTPO'), examinationController.createExamination);
router.get('/events', protect, examinationController.listExaminations);

// Timetable
router.post('/timetable', protect, requireRole('ADMIN', 'CTPO', 'COORDINATOR'), timetableController.createOrUpdateTimetable);

// Marks
router.get('/marks/dataset', protect, requireRole('ADMIN', 'HOD', 'CTPO'), marksController.getAssignedDataset);
router.post('/marks/bulk', protect, requireRole('ADMIN', 'HOD', 'CTPO'), marksController.bulkEnterMarks);

router.post('/marks', protect, requireRole('ADMIN', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR'), marksController.enterMarks);
router.get('/marks/student/:id', protect, marksController.getStudentMarks);
router.get('/marks/internal', protect, marksController.getInternalMarks);

module.exports = router;
