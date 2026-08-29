const express = require('express');
const router = express.Router();

// Define module routes here later
const academicMasterRoutes = require('../modules/academic-master/routes/index');
const examinationRoutes = require('../modules/examination/routes/index');
const resultsBacklogsRoutes = require('../modules/results-backlogs/routes/index');
const academicSupportRoutes = require('../modules/academic-support/routes/index');
const analyticsRoutes = require('../modules/analytics/routes/analytics.routes');
const auditRoutes = require('../modules/audit/routes/audit.routes');

router.use('/academic-master', academicMasterRoutes);
router.use('/examination', examinationRoutes);
router.use('/results-backlogs', resultsBacklogsRoutes);
router.use('/academic-support', academicSupportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'OK' } });
});

module.exports = router;
