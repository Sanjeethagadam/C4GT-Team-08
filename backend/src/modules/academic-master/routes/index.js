const express = require('express');
const router = express.Router();

const campusRoutes = require('./campus.routes');
const branchRoutes = require('./branch.routes');
const campusBranchAvailabilityRoutes = require('./campusBranchAvailability.routes');
const academicYearRoutes = require('./academicYear.routes');
const semesterRoutes = require('./semester.routes');
const sectionRoutes = require('./section.routes');
const subjectRoutes = require('./subject.routes');
const studentRoutes = require('./student.routes');
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');

router.use('/auth', authRoutes);
router.use('/campuses', campusRoutes);
router.use('/branches', branchRoutes);
router.use('/campus-branch-availabilities', campusBranchAvailabilityRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/semesters', semesterRoutes);
router.use('/sections', sectionRoutes);
router.use('/subjects', subjectRoutes);
router.use('/students', studentRoutes);
router.use('/users', userRoutes);

module.exports = router;
