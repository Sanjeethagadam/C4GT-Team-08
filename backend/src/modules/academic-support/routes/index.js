const express = require('express');
const router = express.Router();

const remedialRoutes = require('./remedial.routes');
const guestLectureRoutes = require('./guestLecture.routes');
const attendanceRoutes = require('./attendance.routes');

router.use('/remedial-classes', remedialRoutes);
router.use('/guest-lectures', guestLectureRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;
