const express = require('express');
const router = express.Router();

const semesterResultRoutes = require('./semesterResult.routes');
const riskRoutes = require('./risk.routes');
const backlogRoutes = require('./backlog.routes');

router.use('/semester-results', semesterResultRoutes);
router.use('/risk', riskRoutes);
router.use('/backlogs', backlogRoutes);

module.exports = router;
