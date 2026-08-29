const express = require('express');
const router = express.Router();

const resultRoutes = require('./result.routes');
const backlogRoutes = require('./backlog.routes');
const supplyApplicationRoutes = require('./supplyApplication.routes');
const riskProfileRoutes = require('./riskProfile.routes');
const riskThresholdRoutes = require('./riskThreshold.routes');

router.use('/results', resultRoutes);
router.use('/backlogs', backlogRoutes);
router.use('/supply-applications', supplyApplicationRoutes);
router.use('/risk', riskProfileRoutes);
router.use('/risk-thresholds', riskThresholdRoutes);

module.exports = router;
