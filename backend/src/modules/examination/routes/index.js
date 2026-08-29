const express = require('express');
const router = express.Router();

const examinationRoutes = require('./examination.routes');
const timetableRoutes = require('./timetable.routes');
const markRoutes = require('./mark.routes');

router.use('/examinations', examinationRoutes);
router.use('/timetables', timetableRoutes);
router.use('/marks', markRoutes);

module.exports = router;
