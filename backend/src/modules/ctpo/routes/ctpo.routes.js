const express = require('express');
const router = express.Router();
const ctpoDashboardController = require('../controllers/ctpoDashboard.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);
router.use(requireRole('CTPO'));

const ctpoCoreController = require('../controllers/ctpoCore.controller');
const upload = require('../../../middlewares/upload.middleware');

const exportController = require('../controllers/export.controller');

router.get('/dashboard', ctpoDashboardController.getDashboardMetrics);
router.get('/students', ctpoDashboardController.getStudentsList);
router.get('/students/:id', ctpoDashboardController.getStudentProfile);

// Export Endpoints
router.get('/exports/students', exportController.exportStudentRoster);
router.get('/exports/backlogs', exportController.exportBacklogSummary);
router.get('/exports/risk', exportController.exportRiskSummary);
router.get('/exports/marks/:examType', exportController.exportMarks);
router.get('/exports/profile/:studentId', exportController.exportAcademicProfile);

// Core Phase 12 Endpoints
router.get('/marks-dataset', ctpoCoreController.getMarksDataset);
router.post('/marks', ctpoCoreController.saveMarks);
router.get('/results', ctpoCoreController.getResults);
router.get('/performance', ctpoCoreController.getPerformance);

module.exports = router;
