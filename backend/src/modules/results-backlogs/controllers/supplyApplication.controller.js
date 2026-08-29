const supplyApplicationService = require('../services/supplyApplication.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.create = async (req, res) => {
  try {
    const data = await supplyApplicationService.create(req.body);
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
    
    const { getStudentQueryScope } = require('../../../utils/scopeFilter');
    
    if (role === 'STUDENT') {
      const studentRecord = await Student.findOne({ userId });
      if (!studentRecord) return sendSuccess(res, 200, []);
      query.studentId = studentRecord._id;
    } else if (['CTPO', 'HOD', 'PRINCIPAL'].includes(role)) {
      const studentQuery = getStudentQueryScope(req.user);
      const students = await Student.find(studentQuery).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }

    const SupplyApplication = require('../models/SupplyApplication');
    const data = await SupplyApplication.find(query);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await supplyApplicationService.findById(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const data = await supplyApplicationService.update(req.params.id, req.body);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await supplyApplicationService.remove(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
