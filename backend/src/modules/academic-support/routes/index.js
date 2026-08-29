const express = require('express');
const router = express.Router();

const remedialClassRoutes = require('./remedialClass.routes');
const remedialStudentRoutes = require('./remedialStudent.routes');
const guestLectureRoutes = require('./guestLecture.routes');
const notificationRoutes = require('./notification.routes');

router.use('/remedial-classes', remedialClassRoutes);
router.use('/remedial-students', remedialStudentRoutes);
router.use('/guestlectures', guestLectureRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
