const mongoose = require('mongoose');
const CtpoAssignment = require('../../examination/models/CtpoAssignment');
const Student = require('../../academic-master/models/Student');
const Backlog = require('../../results-backlogs/models/Backlog');
const Semester = require('../../academic-master/models/Semester');
const Subject = require('../../academic-master/models/Subject');
const Marks = require('../../examination/models/Marks');
const SemesterResult = require('../../results-backlogs/models/SemesterResult');
const Notification = require('../../notifications/models/Notification');
const User = require('../../academic-master/models/User');
const { sendSuccess, sendError } = require('../../../utils/response.util');

// Helper to calculate risk
const calculateRisk = (backlogCount) => {
  if (backlogCount <= 1) return 'LOW';
  if (backlogCount <= 4) return 'MEDIUM';
  return 'HIGH'; // AT-RISK is logically MEDIUM + HIGH
};

const getCtpoScope = async (userId) => {
  const assignment = await CtpoAssignment.findOne({ ctpoUserId: userId, status: 'ACTIVE' });
  if (!assignment) throw new Error('No active CTPO assignment found');

  const semester = await Semester.findById(assignment.semesterId);
  if (!semester) throw new Error('Invalid semester in CTPO assignment');

  // Strict scope rule: Branch + Year
  return {
    branchId: assignment.branchId,
    year: semester.year,
    sectionId: assignment.sectionId // User said: "Do not restrict by section unless an explicitly valid section assignment exists and is intended." The earlier Phase 5 controller bypassed sectionId for CTPOs to give full branch view if intended, but let's just use branch and year. Actually the user specifically said: "Do not restrict by section unless an explicitly valid section assignment exists and is intended." For Dashboard, we will give full Branch+Year view since that was the Phase 5 rule ("CTPO -> exactly one Branch + Year + Semester").
  };
};

exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const scope = await getCtpoScope(req.user.id || req.user._id);

    // Fetch students
    const filter = { branchId: scope.branchId, year: scope.year };
    const students = await Student.find(filter).select('_id');
    const studentIds = students.map(s => s._id);

    // Fetch active backlogs
    const backlogs = await Backlog.find({
      studentId: { $in: studentIds },
      status: 'ACTIVE'
    });

    const studentBacklogCounts = {};
    for (const id of studentIds) {
      studentBacklogCounts[id.toString()] = 0;
    }

    let activeBacklogSubjects = 0;
    for (const b of backlogs) {
      studentBacklogCounts[b.studentId.toString()]++;
      activeBacklogSubjects++;
    }

    let studentsWithActiveBacklogs = 0;
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;

    for (const count of Object.values(studentBacklogCounts)) {
      if (count > 0) studentsWithActiveBacklogs++;
      
      const risk = calculateRisk(count);
      if (risk === 'LOW') lowRisk++;
      else if (risk === 'MEDIUM') mediumRisk++;
      else if (risk === 'HIGH') highRisk++;
    }

    return sendSuccess(res, {
      totalStudents: students.length,
      studentsWithActiveBacklogs,
      activeBacklogSubjects,
      riskDistribution: {
        low: lowRisk,
        medium: mediumRisk,
        high: highRisk,
        atRisk: mediumRisk + highRisk
      }
    });
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};

exports.getStudentsList = async (req, res, next) => {
  try {
    const scope = await getCtpoScope(req.user.id || req.user._id);
    const { search, risk, backlog } = req.query;

    const filter = { branchId: scope.branchId, year: scope.year };
    // 'ACTIVE' student status assumed if we don't filter it out, but let's be explicit
    // In db, some students might not have a 'status' field, so we just use the raw filter.

    // 1. Fetch Students
    let query = Student.find(filter).populate('branchId', 'name code');
    if (search) {
      query = query.or([
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ]);
    }

    const students = await query.lean();
    const studentIds = students.map(s => s._id);

    // 2. Fetch Active Backlogs
    const backlogs = await Backlog.find({
      studentId: { $in: studentIds },
      status: 'ACTIVE'
    })
    .populate('subjectId', 'subjectName subjectCode')
    .populate('academicSemesterId', 'semesterCode')
    .lean();

    const backlogMap = {};
    backlogs.forEach(b => {
      const sId = b.studentId.toString();
      backlogMap[sId] = (backlogMap[sId] || 0) + 1;
    });

    let result = students.map(s => {
      const studentBacklogs = backlogs.filter(b => b.studentId.toString() === s._id.toString());
      const bCount = studentBacklogs.length;
      return {
        _id: s._id,
        rollNo: s.rollNo,
        name: s.name,
        branch: s.branchId?.code || '',
        year: s.year,
        activeBacklogCount: bCount,
        riskLevel: calculateRisk(bCount),
        backlogDetails: studentBacklogs.map(b => ({
          subjectName: b.subjectId?.subjectName,
          semesterCode: b.academicSemesterId?.semesterCode
        }))
      };
    });

    if (risk) {
      if (risk === 'AT-RISK') {
        result = result.filter(s => s.riskLevel === 'MEDIUM' || s.riskLevel === 'HIGH');
      } else {
        result = result.filter(s => s.riskLevel === risk);
      }
    }

    if (backlog) {
      if (backlog === 'WITH') result = result.filter(s => s.activeBacklogCount > 0);
      else if (backlog === 'WITHOUT') result = result.filter(s => s.activeBacklogCount === 0);
    }

    return sendSuccess(res, result);
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};

exports.getStudentProfile = async (req, res, next) => {
  try {
    const scope = await getCtpoScope(req.user.id || req.user._id);
    const studentId = req.params.id;

    // Verify scope ownership
    const student = await Student.findOne({
      _id: studentId,
      branchId: scope.branchId,
      year: scope.year
    }).populate('branchId', 'name code').populate('semesterId', 'semesterCode').lean();

    if (!student) return sendError(res, 'Student not found or out of your assigned scope', 404);

    const backlogs = await Backlog.find({
      studentId: student._id,
      status: 'ACTIVE'
    })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('academicSemesterId', 'semesterCode')
      .lean();

    const bCount = backlogs.length;

    // Fetch Marks
    const marks = await Marks.find({ studentId: student._id })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('examinationId', 'name type')
      .lean();

    // Fetch Semester Results
    const semesterResults = await SemesterResult.find({ studentId: student._id })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('academicSemesterId', 'semesterCode')
      .lean();

    // Fetch Notifications via User
    const studentUser = await User.findOne({ 'scopeRef.refId': student._id, role: 'STUDENT' }).select('_id').lean();
    let notifications = [];
    if (studentUser) {
      notifications = await Notification.find({ recipientUserId: studentUser._id }).lean();
    }

    // Build History Timeline
    const history = [];
    for (const b of backlogs) {
      history.push({
        id: `b_${b._id}`,
        type: 'BACKLOG',
        title: `Backlog added for ${b.subjectId?.subjectName || 'Unknown Subject'}`,
        description: `Semester: ${b.academicSemesterId?.semesterCode || 'Unknown'}`,
        date: b.createdAt
      });
    }
    for (const m of marks) {
      history.push({
        id: `m_${m._id}`,
        type: 'MARKS',
        title: `Marks ${m.draft ? 'saved' : 'submitted'} for ${m.subjectId?.subjectName || 'Unknown Subject'}`,
        description: `Exam: ${m.examinationId?.name || 'Unknown Exam'} - ${m.marksObtained}/${m.maxMarks} (${m.status})`,
        date: m.submittedAt || m.updatedAt || m.createdAt
      });
    }
    for (const sr of semesterResults) {
      history.push({
        id: `sr_${sr._id}`,
        type: 'SEMESTER_RESULT',
        title: `Semester Result declared for ${sr.subjectId?.subjectName || 'Unknown Subject'}`,
        description: `Grade: ${sr.grade || 'N/A'}, Result: ${sr.result || 'N/A'}`,
        date: sr.createdAt
      });
    }
    for (const notif of notifications) {
      history.push({
        id: `n_${notif._id}`,
        type: 'NOTIFICATION',
        title: notif.title,
        description: notif.message,
        date: notif.createdAt
      });
    }

    // Sort descending by date
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sendSuccess(res, {
      student: {
        _id: student._id,
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branchId,
        year: student.year,
        currentSemester: student.semesterId?.semesterCode,
        riskLevel: calculateRisk(bCount),
        activeBacklogsCount: bCount
      },
      activeBacklogs: backlogs.map(b => ({
        subjectName: b.subjectId?.subjectName,
        subjectCode: b.subjectId?.subjectCode,
        semester: b.academicSemesterId?.semesterCode
      })),
      marks: marks.map(m => ({
        _id: m._id,
        subjectName: m.subjectId?.subjectName,
        examName: m.examinationId?.name,
        examType: m.examinationId?.type,
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        status: m.status,
        draft: m.draft
      })),
      semesterResults: semesterResults.map(sr => ({
        _id: sr._id,
        subjectName: sr.subjectId?.subjectName,
        semester: sr.academicSemesterId?.semesterCode,
        grade: sr.grade,
        gradePoint: sr.gradePoint,
        credits: sr.credits,
        result: sr.result,
        passed: sr.passed,
        internalMarks: sr.internalMarks,
        externalMarks: sr.externalMarks,
        totalMarks: sr.totalMarks
      })),
      history
    });
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};
