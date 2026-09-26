const Student = require('../../academic-master/models/Student');
const Backlog = require('../../results-backlogs/models/Backlog');
const Marks = require('../../examination/models/Marks');
const SemesterResult = require('../../results-backlogs/models/SemesterResult');
const Subject = require('../../academic-master/models/Subject');
const CtpoAssignment = require('../../examination/models/CtpoAssignment');
const auditService = require('../../audit/services/audit.service');
const xlsx = require('xlsx');

const checkScope = async (req, res) => {
  const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' }).populate('semesterId');
  if (!assignment) {
    res.status(403).json({ success: false, message: 'No active CTPO assignment found' });
    return null;
  }
  return assignment;
};

// Helper to calculate risk (same as Dashboard)
const calculateRisk = (backlogCount) => {
  if (backlogCount <= 1) return 'LOW';
  if (backlogCount <= 4) return 'MEDIUM';
  return 'HIGH'; // AT-RISK is logically MEDIUM + HIGH
};

// Common function to log export
const logExport = async (req, exportType, format, assignment) => {
  await auditService.logAction({
    actor: req.user.id || req.user._id,
    role: req.user.role,
    action: 'EXPORT_GENERATED',
    entityType: 'Export',
    reason: `Exported ${exportType} as ${format}`,
    scope: { branchId: assignment.branchId, year: assignment.semesterId.year },
    timestamp: new Date()
  });
};

exports.exportStudentRoster = async (req, res) => {
  try {
    const assignment = await checkScope(req, res);
    if (!assignment) return;
    
    const { search, risk, backlog } = req.query;
    
    let query = Student.find({ branchId: assignment.branchId, year: assignment.semesterId.year })
      .populate('branchId', 'name code');
      
    if (search) {
      query = query.or([
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ]);
    }

    let students = await query.lean();
    
    // If risk or backlog filters are present, we need active backlogs to calculate
    if (risk || backlog) {
      const studentIds = students.map(s => s._id);
      const backlogs = await Backlog.find({
        studentId: { $in: studentIds },
        status: 'ACTIVE'
      }).lean();
      
      const backlogMap = {};
      backlogs.forEach(b => {
        const sId = b.studentId.toString();
        backlogMap[sId] = (backlogMap[sId] || 0) + 1;
      });
      
      students = students.map(s => {
        const bCount = backlogMap[s._id.toString()] || 0;
        return { ...s, activeBacklogCount: bCount, riskLevel: calculateRisk(bCount) };
      });
      
      if (risk) {
        if (risk === 'AT-RISK') {
          students = students.filter(s => s.riskLevel === 'MEDIUM' || s.riskLevel === 'HIGH');
        } else {
          students = students.filter(s => s.riskLevel === risk);
        }
      }
      
      if (backlog) {
        if (backlog === 'WITH') students = students.filter(s => s.activeBacklogCount > 0);
        else if (backlog === 'WITHOUT') students = students.filter(s => (s.activeBacklogCount || 0) === 0);
      }
    }

    const data = students.map(s => ({
      'Roll No': s.rollNo,
      'Name': s.name,
      'Branch': s.branchId?.name || s.branchId?.code,
      'Year': s.year,
      'Current Semester': s.currentSemester || s.semesterId?.semesterCode || "N/A"
    }));

    await logExport(req, 'Complete Student Roster', req.query.format || 'json', assignment);

    if (req.query.format === 'excel') {
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Roster');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename=student_roster.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportBacklogSummary = async (req, res) => {
  try {
    const assignment = await checkScope(req, res);
    if (!assignment) return;
    
    const students = await Student.find({ branchId: assignment.branchId, year: assignment.semesterId.year }).lean();
    const studentIds = students.map(s => s._id);

    const backlogs = await Backlog.find({ studentId: { $in: studentIds }, status: 'ACTIVE' })
      .populate('subjectId', 'name')
      .populate('studentId', 'rollNo name riskLevel')
      .lean();

    const dataMap = {};
    backlogs.forEach(b => {
      const roll = b.studentId.rollNo;
      if (!dataMap[roll]) {
        dataMap[roll] = {
          'Roll No': roll,
          'Name': b.studentId.name,
          'Active Backlog Count': 0,
          'Risk Level': b.studentId.riskLevel || 'LOW',
          'Full Subject Names': [],
          'Backlog Semester': []
        };
      }
      dataMap[roll]['Active Backlog Count']++;
      dataMap[roll]['Full Subject Names'].push(b.subjectId.name);
      if (!dataMap[roll]['Backlog Semester'].includes(b.originalSemester)) {
        dataMap[roll]['Backlog Semester'].push(b.originalSemester);
      }
    });

    const data = Object.values(dataMap).map(row => ({
      ...row,
      'Full Subject Names': row['Full Subject Names'].join(', '),
      'Backlog Semester': row['Backlog Semester'].join(', ')
    }));

    await logExport(req, 'Active Backlog Summary', req.query.format || 'json', assignment);

    if (req.query.format === 'excel') {
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Backlogs');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename=backlog_summary.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportRiskSummary = async (req, res) => {
  try {
    const assignment = await checkScope(req, res);
    if (!assignment) return;
    
    const students = await Student.find({ branchId: assignment.branchId, year: assignment.semesterId.year }).lean();
    let low = 0, medium = 0, high = 0, atRisk = 0;
    
    students.forEach(s => {
      if (s.riskLevel === 'MEDIUM') medium++;
      else if (s.riskLevel === 'HIGH') high++;
      else if (s.riskLevel === 'AT-RISK') atRisk++;
      else low++;
    });

    const studentIds = students.map(s => s._id);
    const totalBacklogs = await Backlog.countDocuments({ studentId: { $in: studentIds }, status: 'ACTIVE' });

    const data = [{
      'Total Students': students.length,
      'Low Risk': low,
      'Medium Risk': medium,
      'High Risk': high,
      'At Risk': atRisk,
      'Total Active Backlogs': totalBacklogs
    }];

    await logExport(req, 'Risk Summary', req.query.format || 'json', assignment);

    if (req.query.format === 'excel') {
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Risk');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename=risk_summary.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportMarks = async (req, res) => {
  try {
    const assignment = await checkScope(req, res);
    if (!assignment) return;
    
    const examType = req.params.examType; // MID1 or MID2
    if (!['MID1', 'MID2'].includes(examType)) {
      return res.status(400).json({ success: false, message: 'Invalid exam type' });
    }

    const students = await Student.find({ branchId: assignment.branchId, year: assignment.semesterId.year }).lean();
    const studentIds = students.map(s => s._id);

    const marks = await Marks.find({ studentId: { $in: studentIds }, examType })
      .populate('subjectId', 'name')
      .populate('studentId', 'rollNo name')
      .lean();

    const data = marks.map(m => ({
      'Roll No': m.studentId?.rollNo,
      'Name': m.studentId?.name,
      'Full Subject Name': m.subjectId?.name,
      'Marks': m.marksObtained,
      'Status': m.status,
      'Maximum': m.maxMarks || 30
    }));

    await logExport(req, `${examType} Marks`, req.query.format || 'json', assignment);

    if (req.query.format === 'excel') {
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, examType);
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', `attachment; filename=${examType}_marks.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportAcademicProfile = async (req, res) => {
  try {
    const assignment = await checkScope(req, res);
    if (!assignment) return;
    
    const { studentId } = req.params;
    
    const student = await Student.findOne({ _id: studentId, branchId: assignment.branchId, year: assignment.semesterId.year })
      .populate('branchId', 'name code')
      .lean();
      
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    const backlogs = await Backlog.find({ studentId })
      .populate('subjectId', 'name')
      .lean();
      
    const marks = await Marks.find({ studentId })
      .populate('subjectId', 'name')
      .lean();
      
    const semesterResults = await SemesterResult.find({ studentId })
      .populate('subjectId', 'name')
      .lean();

    const data = {
      identity: {
        'Roll No': student.rollNo,
        'Name': student.name,
        'Branch': student.branchId?.name,
        'Year': student.year,
        'Risk': student.riskLevel,
        'Active Backlogs': student.activeBacklogsCount || 0
      },
      backlogs: backlogs.map(b => ({
        'Full Subject Name': b.subjectId?.name,
        'Status': b.status,
        'Original Semester': b.originalSemester
      })),
      marks: marks.map(m => ({
        'Full Subject Name': m.subjectId?.name,
        'Exam Type': m.examType,
        'Marks': m.marksObtained,
        'Status': m.status
      })),
      results: semesterResults.map(r => ({
        'Full Subject Name': r.subjectId?.name,
        'Semester': r.semester,
        'Grade': r.grade,
        'Passed': r.passed ? 'Yes' : 'No'
      }))
    };

    await logExport(req, 'Student Academic Profile', req.query.format || 'json', assignment);

    if (req.query.format === 'excel') {
      const wb = xlsx.utils.book_new();
      
      const wsIdentity = xlsx.utils.json_to_sheet([data.identity]);
      xlsx.utils.book_append_sheet(wb, wsIdentity, 'Identity');
      
      if (data.backlogs.length) {
        const wsBacklogs = xlsx.utils.json_to_sheet(data.backlogs);
        xlsx.utils.book_append_sheet(wb, wsBacklogs, 'Backlogs');
      }
      if (data.marks.length) {
        const wsMarks = xlsx.utils.json_to_sheet(data.marks);
        xlsx.utils.book_append_sheet(wb, wsMarks, 'Internal Marks');
      }
      if (data.results.length) {
        const wsResults = xlsx.utils.json_to_sheet(data.results);
        xlsx.utils.book_append_sheet(wb, wsResults, 'Official Results');
      }
      
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', `attachment; filename=${student.rollNo}_profile.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
