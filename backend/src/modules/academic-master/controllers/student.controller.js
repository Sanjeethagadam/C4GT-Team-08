const studentService = require('../services/student.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.create = async (req, res) => {
  try {
    const data = await studentService.create(req.body);
    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const Student = require('../models/Student');
    const student = await Student.findOne({ userId });
    
    if (!student) return sendError(res, 404, 'Student profile not found');
    
    return sendSuccess(res, 200, student);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

const { getScopeFilter } = require('../../../utils/scopeFilter');

exports.getAll = async (req, res) => {
  try {
    // Exclude pagination parameters if passed to avoid breaking find() filter
    const { limit, page, skip, ...queryParams } = req.query || {};
    
    // Explicitly prevent bypassing scope
    delete queryParams.campusId;
    delete queryParams.branchId;
    delete queryParams.sectionId;

    const filter = { ...queryParams, ...getScopeFilter(req.user) };
    
    // Let service handle it, maybe later we can pass limit
    let query = require('../models/Student').find(filter);
    if (limit) query = query.limit(parseInt(limit, 10));
    
    const data = await query.exec();
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const { role, id: userId, scope } = req.user;
    const Student = require('../models/Student');
    const student = await Student.findById(req.params.id);
    
    if (!student) return sendError(res, 404, 'Not found');

    const { isStudentInScope } = require('../../../utils/scopeFilter');
    if (!isStudentInScope(req.user, student)) {
      return sendError(res, 403, 'Forbidden. Out of scope.');
    }

    return sendSuccess(res, 200, student);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const data = await studentService.update(req.params.id, req.body);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await studentService.remove(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
