const fs = require('fs');
const path = require('path');

const routesConfig = [
  {
    file: 'src/modules/academic-master/routes/campus.routes.js',
    tag: 'Campus',
    pathPrefix: '/academic-master/campuses',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Campus', body: { name: 'string', location: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get all Campuses' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get Campus by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Campus by ID', body: { name: 'string', location: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Campus by ID' }
    ]
  },
  {
    file: 'src/modules/academic-master/routes/branch.routes.js',
    tag: 'Branch',
    pathPrefix: '/academic-master/branches',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Branch', body: { name: 'string', campusId: 'string', headOfDepartmentId: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get all Branches' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get Branch by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Branch by ID', body: { name: 'string', headOfDepartmentId: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Branch by ID' }
    ]
  },
  {
    file: 'src/modules/academic-master/routes/semester.routes.js',
    tag: 'Semester',
    pathPrefix: '/academic-master/semesters',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Semester', body: { name: 'string', status: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Semesters' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Semester by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Semester by ID', body: { name: 'string', status: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Semester by ID' }
    ]
  },
  {
    file: 'src/modules/academic-master/routes/subject.routes.js',
    tag: 'Subject',
    pathPrefix: '/academic-master/subjects',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Subject', body: { name: 'string', code: 'string', credits: 'number', branchId: 'string', semesterId: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Subjects' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Subject by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Subject by ID', body: { name: 'string', code: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Subject by ID' }
    ]
  },
  {
    file: 'src/modules/academic-master/routes/student.routes.js',
    tag: 'Student',
    pathPrefix: '/academic-master/students',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN, CTPO', summary: 'Create Student', body: { rollNumber: 'string', name: 'string', campusId: 'string', branchId: 'string', section: 'string', userId: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get all Students' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Student by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN, CTPO', summary: 'Update Student by ID', body: { name: 'string', section: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Student by ID' }
    ]
  },
  {
    file: 'src/modules/examination/routes/examination.routes.js',
    tag: 'Examination',
    pathPrefix: '/examination/examinations',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Examination', body: { semesterId: 'string', examinationType: 'string', status: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Examinations' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Examination by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Examination by ID', body: { status: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Examination by ID' }
    ]
  },
  {
    file: 'src/modules/examination/routes/timetable.routes.js',
    tag: 'Timetable',
    pathPrefix: '/examination/timetables',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Timetable', body: { examinationId: 'string', subjectId: 'string', date: 'string', startTime: 'string', endTime: 'string', venue: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Timetables' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Timetable by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Timetable by ID', body: { venue: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Timetable by ID' }
    ]
  },
  {
    file: 'src/modules/examination/routes/mark.routes.js',
    tag: 'Marks',
    pathPrefix: '/examination/marks',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN, CTPO', summary: 'Create Marks', body: { studentId: 'string', subjectId: 'string', examinationId: 'string', marks: 'number' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get all Marks' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Marks by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN, CTPO', summary: 'Update Marks by ID', body: { marks: 'number' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Marks by ID' }
    ]
  },
  {
    file: 'src/modules/results-backlogs/routes/result.routes.js',
    tag: 'Result',
    pathPrefix: '/results-backlogs/results',
    routes: [
      { method: 'post', path: '/import', roles: 'ADMIN, COORDINATOR', summary: 'Import Results from CSV' },
      { method: 'post', path: '/pdf/preview', roles: 'ADMIN, COORDINATOR', summary: 'Preview Results from PDF' },
      { method: 'post', path: '/pdf/confirm', roles: 'ADMIN, COORDINATOR', summary: 'Confirm Results from PDF' },
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Result manually', body: { studentId: 'string', subjectId: 'string', semesterId: 'string', resultStatus: 'string', grade: 'string', source: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Results' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Result by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Result by ID', body: { resultStatus: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Result by ID' }
    ]
  },
  {
    file: 'src/modules/results-backlogs/routes/backlog.routes.js',
    tag: 'Backlog',
    pathPrefix: '/results-backlogs/backlogs',
    routes: [
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Backlogs' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Backlog by ID' }
    ]
  },
  {
    file: 'src/modules/results-backlogs/routes/supplyApplication.routes.js',
    tag: 'SupplyApplication',
    pathPrefix: '/results-backlogs/supply-applications',
    routes: [
      { method: 'post', path: '/', roles: 'STUDENT', summary: 'Create Supply Application', body: { backlogId: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get all Supply Applications' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Supply Application by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Supply Application by ID', body: { paymentStatus: 'string' } }
    ]
  },
  {
    file: 'src/modules/results-backlogs/routes/riskProfile.routes.js',
    tag: 'Risk',
    pathPrefix: '/results-backlogs/risk',
    routes: [
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get all Risk Profiles' },
      { method: 'get', path: '/:studentId', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, STUDENT', summary: 'Get Risk Profile by Student ID' }
    ]
  },
  {
    file: 'src/modules/results-backlogs/routes/riskThreshold.routes.js',
    tag: 'RiskThreshold',
    pathPrefix: '/results-backlogs/risk-thresholds',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN', summary: 'Create Risk Threshold', body: { level: 'string', condition: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get all Risk Thresholds' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO', summary: 'Get Risk Threshold by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN', summary: 'Update Risk Threshold by ID', body: { condition: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN', summary: 'Delete Risk Threshold by ID' }
    ]
  },
  {
    file: 'src/modules/academic-support/routes/remedialClass.routes.js',
    tag: 'RemedialClass',
    pathPrefix: '/academic-support/remedial-classes',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN, COORDINATOR', summary: 'Create Remedial Class', body: { subjectId: 'string', campusId: 'string', branchId: 'string', coordinatorId: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get all Remedial Classes' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Remedial Class by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN, COORDINATOR', summary: 'Update Remedial Class by ID', body: { schedule: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN, COORDINATOR', summary: 'Delete Remedial Class by ID' }
    ]
  },
  {
    file: 'src/modules/academic-support/routes/guestLecture.routes.js',
    tag: 'GuestLecture',
    pathPrefix: '/academic-support/guest-lectures',
    routes: [
      { method: 'post', path: '/', roles: 'ADMIN, COORDINATOR', summary: 'Create Guest Lecture', body: { lecturerName: 'string', subjectId: 'string', campusId: 'string', branchId: 'string' } },
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get all Guest Lectures' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Guest Lecture by ID' },
      { method: 'put', path: '/:id', roles: 'ADMIN, COORDINATOR', summary: 'Update Guest Lecture by ID', body: { venue: 'string' } },
      { method: 'delete', path: '/:id', roles: 'ADMIN, COORDINATOR', summary: 'Delete Guest Lecture by ID' }
    ]
  },
  {
    file: 'src/modules/academic-support/routes/notification.routes.js',
    tag: 'Notification',
    pathPrefix: '/academic-support/notifications',
    routes: [
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get all Notifications' },
      { method: 'get', path: '/:id', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Notification by ID' },
      { method: 'put', path: '/:id/read', roles: 'STUDENT', summary: 'Mark Notification as read' }
    ]
  },
  {
    file: 'src/modules/analytics/routes/analytics.routes.js',
    tag: 'Analytics',
    pathPrefix: '/analytics',
    routes: [
      { method: 'get', path: '/academic', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Academic Trends' },
      { method: 'get', path: '/results', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Results Distribution' },
      { method: 'get', path: '/backlogs', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Backlogs Distribution' },
      { method: 'get', path: '/risk', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Risk Distribution' },
      { method: 'get', path: '/remedial', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Remedial Stats' },
      { method: 'get', path: '/guest-lectures', roles: 'ADMIN, PRINCIPAL, HOD, CTPO, COORDINATOR, STUDENT', summary: 'Get Guest Lecture Stats' },
      { method: 'get', path: '/campus', roles: 'ADMIN, PRINCIPAL', summary: 'Get Campus KPIs' }
    ]
  },
  {
    file: 'src/modules/audit/routes/audit.routes.js',
    tag: 'Audit Logs',
    pathPrefix: '/audit-logs',
    routes: [
      { method: 'get', path: '/', roles: 'ADMIN, PRINCIPAL', summary: 'Get Audit Logs' }
    ]
  }
];

routesConfig.forEach(config => {
  const filePath = path.resolve(__dirname, config.file);
  if (!fs.existsSync(filePath)) return console.error("File not found", filePath);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Inject general tag annotation
  if (!content.includes(`@swagger\n * tags:\n *   name: ${config.tag}`)) {
    content = content.replace(/(const router = express\.Router\(\);)/, `$1\n\n/**\n * @swagger\n * tags:\n *   name: ${config.tag}\n *   description: ${config.tag} management API\n */\n`);
  }

  // Inject routes annotations
  config.routes.forEach(route => {
    // Basic RegExp to find router.get('/', ...) etc. We will replace the start of the line.
    const routePattern = route.path === '/' ? `\\/` : route.path.replace(/\//g, '\\/').replace(/:/g, ':');
    const routeRegex = new RegExp(`^router\\.${route.method}\\(\\'${routePattern}\\'\\s*,`, 'm');
    
    if (content.match(routeRegex) && !content.includes(`summary: ${route.summary}`)) {
      let params = '';
      if (route.path.includes(':id')) {
        params = `\n *     parameters:\n *       - in: path\n *         name: id\n *         required: true\n *         schema:\n *           type: string`;
      } else if (route.path.includes(':studentId')) {
        params = `\n *     parameters:\n *       - in: path\n *         name: studentId\n *         required: true\n *         schema:\n *           type: string`;
      }

      let reqBody = '';
      if (route.body) {
        reqBody = `\n *     requestBody:\n *       required: true\n *       content:\n *         application/json:\n *           schema:\n *             type: object\n *             properties:\n` + Object.entries(route.body).map(([k, v]) => ` *               ${k}:\n *                 type: ${v}`).join('\n');
      }

      const annotation = `/**\n * @swagger\n * /api/v1${config.pathPrefix}${route.path === '/' ? '' : route.path.replace(/:id/g, '{id}').replace(/:studentId/g, '{studentId}')}:\n *   ${route.method}:\n *     summary: ${route.summary}\n *     tags: [${config.tag}]\n *     security:\n *       - bearerAuth: []${params}${reqBody}\n *     responses:\n *       200:\n *         description: Success\n *       201:\n *         description: Created successfully\n *       401:\n *         description: Unauthorized\n *       403:\n *         description: Forbidden (Requires roles: ${route.roles})\n *       404:\n *         description: Not found\n */\n`;
      content = content.replace(routeRegex, annotation + '$&');
    }
  });

  fs.writeFileSync(filePath, content);
});

console.log("Annotations injected.");
