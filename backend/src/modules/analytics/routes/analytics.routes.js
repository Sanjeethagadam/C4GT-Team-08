const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect); // All analytics endpoints require auth

// Campus KPIs can be viewed by all these roles including COORDINATOR
router.get('/campus', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO', 'COORDINATOR'), analyticsController.getCampusKPIs);

// Academic, Results, Backlogs, and Risk are restricted from COORDINATOR
router.get('/academic', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), analyticsController.getAcademicTrends);
router.get('/results', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), analyticsController.getResultsDistribution);
router.get('/backlogs', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), analyticsController.getBacklogsDistribution);
router.get('/risk', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), analyticsController.getRiskDistribution);
router.get('/historical-students', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), analyticsController.getHistoricalStudents);

// Remedial and Guest Lectures are accessible to COORDINATOR + Management
router.get('/remedial', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'COORDINATOR'), analyticsController.getRemedialStats);
router.get('/guest-lectures', requireRole('ADMIN', 'PRINCIPAL', 'HOD', 'COORDINATOR'), analyticsController.getGuestLectureStats);

router.get('/student/me', requireRole('STUDENT'), analyticsController.getStudentPersonalAnalytics);
router.get('/admin-dashboard', requireRole('ADMIN'), analyticsController.getAdminDashboard);
router.get('/branches-performance', requireRole('ADMIN', 'PRINCIPAL', 'HOD'), analyticsController.getBranchesPerformance);
router.get('/years-performance', requireRole('ADMIN', 'PRINCIPAL', 'HOD'), analyticsController.getYearsPerformance);

module.exports = router;
