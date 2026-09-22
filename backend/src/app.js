const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const mongoose = require('mongoose');

const app = express();

const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Middleware to prevent indefinite request buffering if DB is disconnected
app.use(['/api', '/api/v1'], (req, res, next) => {
  if (req.path === '/health' || req.originalUrl === '/api/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection in progress. Please ensure 0.0.0.0/0 (or your IP) is allowed in MongoDB Atlas -> Network Access, or that MongoDB is running.'
    });
  }
  next();
});

// Route loaders - mount on both /api and /api/v1 for seamless client compatibility
const authRoutes = require('./modules/academic-master/routes/auth.routes');
const campusRoutes = require('./modules/academic-master/routes/campus.routes');
const branchRoutes = require('./modules/academic-master/routes/branch.routes');
const availabilityRoutes = require('./modules/academic-master/routes/campusBranchAvailability.routes');
const academicYearRoutes = require('./modules/academic-master/routes/academicYear.routes');
const semesterRoutes = require('./modules/academic-master/routes/semester.routes');
const sectionRoutes = require('./modules/academic-master/routes/section.routes');
const subjectRoutes = require('./modules/academic-master/routes/subject.routes');
const mappingRoutes = require('./modules/academic-master/routes/subjectBranchMapping.routes');
const studentRoutes = require('./modules/academic-master/routes/student.routes');
const userRoutes = require('./modules/academic-master/routes/user.routes');
const internalRoutes = require('./modules/academic-master/routes/internal.routes');

const examRoutes = require('./modules/examination/routes');
const resultsRoutes = require('./modules/results-backlogs/routes');
const academicSupportRoutes = require('./modules/academic-support/routes');
const notificationRoutes = require('./modules/notifications/routes');
const analyticsRoutes = require('./modules/analytics/routes/analytics.routes');
const ctpoRoutes = require('./modules/ctpo/routes/ctpo.routes');

['/api', '/api/v1'].forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/campuses`, campusRoutes);
  app.use(`${prefix}/branches`, branchRoutes);
  app.use(`${prefix}/campus-branch-availability`, availabilityRoutes);
  app.use(`${prefix}/academic-years`, academicYearRoutes);
  app.use(`${prefix}/semesters`, semesterRoutes);
  app.use(`${prefix}/sections`, sectionRoutes);
  app.use(`${prefix}/subjects`, subjectRoutes);
  app.use(`${prefix}/subject-branch-mappings`, mappingRoutes);
  app.use(`${prefix}/students`, studentRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/internal`, internalRoutes);

  app.use(`${prefix}/examination`, examRoutes);
  app.use(`${prefix}/results-backlogs`, resultsRoutes);
  app.use(`${prefix}/academic-support`, academicSupportRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/analytics`, analyticsRoutes);
  app.use(`${prefix}/ctpo`, ctpoRoutes);
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
