const mongoose = require('mongoose');
const CtpoAssignment = require('../../examination/models/CtpoAssignment');
const Student = require('../../academic-master/models/Student');
const Backlog = require('../../results-backlogs/models/Backlog');
const Semester = require('../../academic-master/models/Semester');
const Subject = require('../../academic-master/models/Subject');
const SubjectBranchMapping = require('../../academic-master/models/SubjectBranchMapping');
const Marks = require('../../examination/models/Marks');
const Examination = require('../../examination/models/Examination');
const SemesterResult = require('../../results-backlogs/models/SemesterResult');
const Notification = require('../../notifications/models/Notification');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const auditService = require('../../audit/services/audit.service');
const AcademicResultService = require('../../results-backlogs/services/academicResult.service');

// Helper to get active scope (reused)
const getCtpoScope = async (userId) => {
  const assignment = await CtpoAssignment.findOne({ ctpoUserId: userId, status: 'ACTIVE' })
    .populate('branchId')
    .populate('academicYearId')
    .populate('semesterId');
  if (!assignment) throw new Error('No active CTPO assignment found');
  return {
    branchId: assignment.branchId._id,
    year: assignment.semesterId.year,
    semesterId: assignment.semesterId._id,
    academicYearId: assignment.academicYearId._id,
    assignment
  };
};

exports.getMarksDataset = async (req, res, next) => {
  try {
    const { examType } = req.query; // 'MID1' or 'MID2'
    if (!['MID1', 'MID2'].includes(examType)) {
      return sendError(res, 'Invalid examType. Must be MID1 or MID2.', 400);
    }

    const scope = await getCtpoScope(req.user.id || req.user._id);

    // Get all students in scope
    const students = await Student.find({ branchId: scope.branchId, year: scope.year }).select('_id name rollNo').lean();
    const studentIds = students.map(s => s._id);

    // Get subjects for this semester/branch mapping
    const sbms = await SubjectBranchMapping.find({
      branchId: scope.branchId,
      semesterId: scope.semesterId
    }).populate('subjectId', 'subjectName subjectCode').lean();

    const subjects = sbms.map(m => m.subjectId).filter(Boolean);

    // Ensure Examination exists for this CTPO context
    let exam = await Examination.findOne({
      examType,
      academicYearId: scope.academicYearId,
      semesterId: scope.semesterId
    }).lean();

    if (!exam) {
      exam = await Examination.create({
        examType,
        academicYearId: scope.academicYearId,
        semesterId: scope.semesterId,
        status: 'SCHEDULED'
      });
    }

    // Get existing marks
    const marks = await Marks.find({
      examinationId: exam._id,
      studentId: { $in: studentIds }
    }).lean();

    return sendSuccess(res, {
      students,
      subjects,
      exam,
      marks
    });
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};

exports.saveMarks = async (req, res, next) => {
  try {
    const { examinationId, marksData, isSubmit } = req.body;
    
    if (!examinationId || !Array.isArray(marksData)) {
      return sendError(res, 'examinationId and marksData array are required', 400);
    }

    const scope = await getCtpoScope(req.user.id || req.user._id);

    // Validate the exam belongs to the CTPO's current scope
    const exam = await Examination.findById(examinationId);
    if (!exam) return sendError(res, 'Examination not found', 404);

    if (exam.academicYearId.toString() !== scope.academicYearId.toString() || exam.semesterId.toString() !== scope.semesterId.toString()) {
      return sendError(res, 'Examination is out of your current CTPO scope', 403);
    }

    const bulkOps = [];
    
    // Batch fetch students to ensure they are in scope
    const requestedStudentIds = [...new Set(marksData.map(m => m.studentId))];
    const validStudents = await Student.find({
      _id: { $in: requestedStudentIds },
      branchId: scope.branchId,
      year: scope.year
    }).select('_id').lean();
    const validStudentIds = new Set(validStudents.map(s => s._id.toString()));

    for (const m of marksData) {
      if (!validStudentIds.has(m.studentId.toString())) {
        continue; // Skip out-of-scope students to prevent unauthorized modifications
      }

      if (exam.examType === 'MID1' || exam.examType === 'MID2') {
        if (m.maxMarks !== 30) {
          return sendError(res, 'maxMarks must be 30 for MID exams', 400);
        }
        if (m.status === 'ATTENDED' && (m.marksObtained < 0 || m.marksObtained > 30)) {
          return sendError(res, 'marksObtained must be between 0 and 30', 400);
        }
      }

      const updatePayload = {
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        status: m.status,
        draft: !isSubmit,
        lastModifiedBy: req.user.id || req.user._id
      };

      if (isSubmit) {
        updatePayload.submittedAt = new Date();
      }

      bulkOps.push({
        updateOne: {
          filter: {
            studentId: m.studentId,
            examinationId,
            subjectId: m.subjectId
          },
          update: { $set: updatePayload },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await Marks.bulkWrite(bulkOps);
      
      // Audit log
      await auditService.logAction({
        actor: req.user.id || req.user._id,
        role: req.user.role,
        action: isSubmit ? 'MARK_SUBMITTED' : 'MARK_CREATED',
        entityType: 'Marks',
        entityId: examinationId,
        reason: `Processed ${bulkOps.length} marks records for ${exam.examType}`,
        scope: { branchId: scope.branchId, year: scope.year },
        timestamp: new Date()
      });
    }

    return sendSuccess(res, {
      message: `Successfully ${isSubmit ? 'submitted' : 'saved draft'} for ${bulkOps.length} marks records.`
    });
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const { semesterCode } = req.query;
    const scope = await getCtpoScope(req.user.id || req.user._id);

    const students = await Student.find({ branchId: scope.branchId, year: scope.year }).select('_id name rollNo branchId year').lean();
    const studentIds = students.map(s => s._id);

    const query = { studentId: { $in: studentIds } };
    
    const options = { semesterCode };

    const finalData = await AcademicResultService.getUnifiedResults(students, options);

    return sendSuccess(res, {
      results: finalData,
      year: scope.year
    });
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};

exports.getPerformance = async (req, res, next) => {
  try {
    const scope = await getCtpoScope(req.user.id || req.user._id);

    const students = await Student.find({ branchId: scope.branchId, year: scope.year }).select('_id').lean();
    const studentIds = students.map(s => s._id);

    const exams = await Examination.find({
      academicYearId: scope.academicYearId,
      semesterId: scope.semesterId,
      examType: { $in: ['MID1', 'MID2'] }
    }).lean();

    const examIds = exams.map(e => e._id);

    const marks = await Marks.find({
      studentId: { $in: studentIds },
      examinationId: { $in: examIds },
      draft: false // Only submitted marks count for performance
    }).lean();

    // Compute KPIs
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let studentScores = {};

    marks.forEach(m => {
      totalMarksObtained += m.marksObtained;
      totalMaxMarks += m.maxMarks;
      if (!studentScores[m.studentId]) studentScores[m.studentId] = { ob: 0, mx: 0 };
      studentScores[m.studentId].ob += m.marksObtained;
      studentScores[m.studentId].mx += m.maxMarks;
    });

    const averageMarks = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    
    let highest = 0;
    let lowest = 100;
    Object.values(studentScores).forEach(s => {
      const p = s.mx > 0 ? (s.ob / s.mx) * 100 : 0;
      if (p > highest) highest = p;
      if (p < lowest) lowest = p;
    });
    if (lowest === 100 && Object.keys(studentScores).length === 0) lowest = 0;

    // Distribution
    const distributionMap = {
      '0-39': 0, '40-59': 0, '60-74': 0, '75-89': 0, '90-100': 0
    };
    
    Object.values(studentScores).forEach(s => {
      const p = s.mx > 0 ? (s.ob / s.mx) * 100 : 0;
      if (p < 40) distributionMap['0-39']++;
      else if (p < 60) distributionMap['40-59']++;
      else if (p < 75) distributionMap['60-74']++;
      else if (p < 90) distributionMap['75-89']++;
      else distributionMap['90-100']++;
    });

    const distribution = Object.keys(distributionMap).map(k => ({
      range: k, count: distributionMap[k]
    }));

    // Trends MID1 vs MID2
    const trends = [];
    ['MID1', 'MID2'].forEach(type => {
      const ex = exams.find(e => e.examType === type);
      if (ex) {
        const exMarks = marks.filter(m => m.examinationId.toString() === ex._id.toString());
        const exTotalOb = exMarks.reduce((acc, m) => acc + m.marksObtained, 0);
        const exTotalMx = exMarks.reduce((acc, m) => acc + m.maxMarks, 0);
        trends.push({
          name: type,
          averageMarks: exTotalMx > 0 ? Number(((exTotalOb / exTotalMx) * 100).toFixed(1)) : 0
        });
      }
    });

    return sendSuccess(res, {
      kpis: {
        averageMarks,
        highestAverage: highest,
        lowestAverage: lowest,
        examsRecorded: exams.length
      },
      distribution,
      trends,
      availableSemesters: [scope.semesterId] // Only current sem allowed per spec
    });
  } catch (error) {
    if (error.message === 'No active CTPO assignment found') return sendError(res, error.message, 403);
    next(error);
  }
};
