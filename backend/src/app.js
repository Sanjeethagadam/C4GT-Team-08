const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Route loader
app.use('/api/auth', require('./modules/academic-master/routes/auth.routes'));
app.use('/api/campuses', require('./modules/academic-master/routes/campus.routes'));
app.use('/api/branches', require('./modules/academic-master/routes/branch.routes'));
app.use('/api/campus-branch-availability', require('./modules/academic-master/routes/campusBranchAvailability.routes'));
app.use('/api/academic-years', require('./modules/academic-master/routes/academicYear.routes'));
app.use('/api/semesters', require('./modules/academic-master/routes/semester.routes'));
app.use('/api/sections', require('./modules/academic-master/routes/section.routes'));
app.use('/api/subjects', require('./modules/academic-master/routes/subject.routes'));
app.use('/api/subject-branch-mappings', require('./modules/academic-master/routes/subjectBranchMapping.routes'));
app.use('/api/students', require('./modules/academic-master/routes/student.routes'));
app.use('/api/users', require('./modules/academic-master/routes/user.routes'));
app.use('/api/internal', require('./modules/academic-master/routes/internal.routes'));
app.use('/api/v1/examination', require('./modules/examination/routes'));
app.use('/api/v1/results-backlogs', require('./modules/results-backlogs/routes'));
app.use('/api/v1/academic-support', require('./modules/academic-support/routes'));
app.use('/api/v1/notifications', require('./modules/notifications/routes'));
app.use('/api/v1/analytics', require('./modules/analytics/routes/analytics.routes'));
app.use('/api/v1/ctpo', require('./modules/ctpo/routes/ctpo.routes'));

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
