const Backlog = require('../models/Backlog');
const Student = require('../../academic-master/models/Student');
const AcademicSemester = require('../../academic-master/models/Semester');
const Section = require('../../academic-master/models/Section');

exports.getBacklogStudents = async (req, res) => {
  try {
    const { branchId, year, semester, semesterCode, academicSemesterId, sectionId, subjectId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build Student Match Query based on permissions and filters
    let studentQuery = {};
    if (branchId) studentQuery.branchId = new (require('mongoose').Types.ObjectId)(branchId);
    
    if (!academicSemesterId) {
      if (year) studentQuery.year = parseInt(year);
      if (sectionId) {
        if (sectionId === 'unassigned') studentQuery.sectionId = null;
        else studentQuery.sectionId = new (require('mongoose').Types.ObjectId)(sectionId);
      }
    }

    if (req.user.role === 'CTPO') {
      const CtpoAssignment = require('../../examination/models/CtpoAssignment');
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' });
      if (assignment) {
        studentQuery.sectionId = assignment.sectionId;
        studentQuery.branchId = assignment.branchId;
      } else {
        studentQuery._id = '000000000000000000000000'; 
      }
    } else if (req.user.role === 'HOD') {
      if (req.user.scope && req.user.scope.year) {
        studentQuery.year = Number(req.user.scope.year);
      }
      if (req.user.scopeRef) {
        const scopeType = req.user.scopeRef.type || req.user.scopeRef.refModel;
        if (scopeType === 'Campus') studentQuery.campusId = new (require('mongoose').Types.ObjectId)(req.user.scopeRef.refId);
        if (scopeType === 'Branch') studentQuery.branchId = new (require('mongoose').Types.ObjectId)(req.user.scopeRef.refId);
      }
    } else if (req.user.scopeRef) {
      const scopeType = req.user.scopeRef.type || req.user.scopeRef.refModel;
      if (scopeType === 'Campus') studentQuery.campusId = new (require('mongoose').Types.ObjectId)(req.user.scopeRef.refId);
      if (scopeType === 'Branch') studentQuery.branchId = new (require('mongoose').Types.ObjectId)(req.user.scopeRef.refId);
    }

    // Build Backlog Match Query
    const backlogMatch = { status: 'ACTIVE' };
    if (semester) backlogMatch.academicSemesterId = new (require('mongoose').Types.ObjectId)(semester);
    if (academicSemesterId) backlogMatch.academicSemesterId = new (require('mongoose').Types.ObjectId)(academicSemesterId);
    if (subjectId) backlogMatch.subjectId = new (require('mongoose').Types.ObjectId)(subjectId);

    if (semesterCode) {
      const Semester = require('../../academic-master/models/Semester');
      const sems = await Semester.find({ semesterCode }).select('_id');
      if (sems.length > 0) {
        backlogMatch.academicSemesterId = { $in: sems.map(s => s._id) };
      } else {
        backlogMatch.academicSemesterId = null; // No matching semesters, return empty
      }
    }

    const mongoose = require('mongoose');

    // Aggregate to find students with backlogs, applying filters efficiently
    const pipeline = [
      { $match: backlogMatch },
      { $group: { 
          _id: '$studentId', 
          backlogs: { $push: '$$ROOT' },
          activeBacklogCount: { $sum: 1 }
        } 
      },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: Object.keys(studentQuery).length > 0 ? Object.entries(studentQuery).reduce((acc, [k, v]) => ({ ...acc, [`student.${k}`]: v }), {}) : {} },
      { $facet: {
          metadata: [ { $count: 'total' }, { $addFields: { page: parseInt(page) } } ],
          data: [
            { $sort: { 'student.rollNo': 1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            { $lookup: { from: 'branches', localField: 'student.branchId', foreignField: '_id', as: 'student.branch' } },
            { $unwind: { path: '$student.branch', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'sections', localField: 'student.sectionId', foreignField: '_id', as: 'student.section' } },
            { $unwind: { path: '$student.section', preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ];

    const results = await Backlog.aggregate(pipeline);
    const metadata = results[0].metadata[0] || { total: 0, page: parseInt(page) };
    const paginatedData = results[0].data;

    // Populate Backlog references (Subject, Semester) manually for the paginated slice
    await Backlog.populate(paginatedData, { path: 'backlogs.subjectId', select: 'subjectName subjectCode', model: 'Subject' });
    await Backlog.populate(paginatedData, { path: 'backlogs.academicSemesterId', select: 'semesterCode', model: 'Semester' });

    const formattedData = paginatedData.map(item => ({
      student: {
        _id: item.student._id,
        rollNo: item.student.rollNo,
        name: item.student.name,
        branch: item.student.branch,
        year: item.student.year,
        section: item.student.section
      },
      activeBacklogCount: item.activeBacklogCount,
      backlogs: item.backlogs
    }));

    res.status(200).json({ status: 'success', data: formattedData, pagination: { total: metadata.total, page: metadata.page, limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getBacklogs = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'STUDENT') {
      const studentId = req.user.scopeRef?.refId;
      if (!studentId) return res.status(400).json({ status: 'error', message: 'Student ID not found in token' });
      query.studentId = studentId;
    } else {
      // Future expansion for CTPO/Admin if needed
      if (req.query.studentId) query.studentId = req.query.studentId;
    }

    if (req.query.status) query.status = req.query.status;

    const backlogs = await Backlog.find(query)
      .populate('subjectId', 'subjectName subjectCode credits')
      .populate('academicSemesterId', 'semesterCode')
      .lean();

    res.status(200).json({ status: 'success', data: backlogs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
