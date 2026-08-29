const remedialClassService = require('../services/remedialClass.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.create = async (req, res) => {
  try {
    const data = await remedialClassService.create(req.body);
    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { role, scope, id: userId } = req.user;
    let query = {};
    const { getScopeFilter } = require('../../../utils/scopeFilter');
    
    if (role === 'STUDENT') {
      const Student = require('../../academic-master/models/Student');
      const student = await Student.findOne({ userId });
      if (!student) return sendSuccess(res, 200, []);
      
      const RemedialStudent = require('../models/RemedialStudent');
      const enrolled = await RemedialStudent.find({ studentId: student._id });
      query._id = { $in: enrolled.map(e => e.remedialClassId) };
    } else if (role === 'CTPO') {
      const Section = require('../../academic-master/models/Section');
      if (scope.sectionId) {
        const section = await Section.findById(scope.sectionId);
        if (section) {
           query.branchId = section.branchId;
           query.year = section.year;
        } else {
           return sendSuccess(res, 200, []);
        }
      }
    } else if (['HOD', 'PRINCIPAL', 'COORDINATOR'].includes(role)) {
      query = { ...query, ...getScopeFilter(req.user) };
      // getScopeFilter puts sectionId for CTPO, which doesn't apply to RemedialClass, but we handled CTPO above
    }

    const RemedialClass = require('../models/RemedialClass');
    const data = await RemedialClass.find(query);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await remedialClassService.findById(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const data = await remedialClassService.update(req.params.id, req.body);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await remedialClassService.remove(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
