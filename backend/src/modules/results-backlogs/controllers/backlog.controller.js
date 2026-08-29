const backlogService = require('../services/backlog.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.create = async (req, res) => {
  try {
    const data = await backlogService.create(req.body);
    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { role, scope, id: userId } = req.user;
    let query = {};
    const Student = require('../../academic-master/models/Student');
    
    const { getStudentQueryScope, isStudentInScope } = require('../../../utils/scopeFilter');
    
    if (role === 'STUDENT') {
      const studentRecord = await Student.findOne({ userId });
      if (!studentRecord) return sendSuccess(res, 200, []);
      query.studentId = studentRecord._id;
    } else if (['CTPO', 'HOD', 'PRINCIPAL'].includes(role)) {
      const studentQuery = getStudentQueryScope(req.user);
      const students = await Student.find(studentQuery).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }

    const Backlog = require('../models/Backlog');
    const data = await Backlog.find(query);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await backlogService.findById(req.params.id);
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
    const data = await backlogService.update(req.params.id, req.body);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await backlogService.remove(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
