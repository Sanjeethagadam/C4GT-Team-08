const markService = require('../services/mark.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.create = async (req, res) => {
  try {
    const { role, scope, id: userId } = req.user;
    const { studentId, examinationId, marks } = req.body;
    
    const Student = require('../../academic-master/models/Student');
    const Examination = require('../models/Examination');

    // 1. Verify student exists and CTPO scope
    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 404, 'Student not found');
    
    if (role === 'CTPO' && scope.sectionId && student.sectionId.toString() !== scope.sectionId) {
      return sendError(res, 403, 'Forbidden. Student is not in your assigned section.');
    }

    // 2. Verify examination exists and maxMarks
    const exam = await Examination.findById(examinationId);
    if (!exam) return sendError(res, 404, 'Examination not found');
    
    if (marks > exam.maxMarks) {
      return sendError(res, 400, `Marks cannot exceed maxMarks (${exam.maxMarks})`);
    }

    req.body.enteredBy = userId;
    const data = await markService.create(req.body);
    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { role, scope, id: userId } = req.user;
    let query = {};
    
    // We need to fetch student records first to filter by campus/branch/section for HOD/CTPO/Principal
    const Student = require('../../academic-master/models/Student');
    
    const { getStudentQueryScope, isStudentInScope } = require('../../../utils/scopeFilter');
    
    if (role === 'STUDENT') {
      const studentRecord = await Student.findOne({ userId });
      if (!studentRecord) return sendSuccess(res, 200, []);
      query.studentId = studentRecord._id;
    } else if (['CTPO', 'HOD', 'PRINCIPAL'].includes(role)) {
      const studentQuery = getStudentQueryScope(req.user);
      
      const students = await Student.find(studentQuery).select('_id');
      const studentIds = students.map(s => s._id);
      query.studentId = { $in: studentIds };
    }

    const Mark = require('../models/Mark');
    const data = await Mark.find(query);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await markService.findById(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    
    const Student = require('../../academic-master/models/Student');
    const student = await Student.findById(data.studentId);
    
    if (student) {
      const { isStudentInScope } = require('../../../utils/scopeFilter');
      if (!isStudentInScope(req.user, student)) {
        return sendError(res, 403, 'Forbidden. Out of scope.');
      }
    }
    
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const data = await markService.update(req.params.id, req.body);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await markService.remove(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
