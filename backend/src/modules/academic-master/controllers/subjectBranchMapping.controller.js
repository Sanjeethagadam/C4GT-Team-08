const SubjectBranchMappingService = require('../services/subjectBranchMapping.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createMapping = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const mapping = await SubjectBranchMappingService.createMapping(req.body);
    return sendSuccess(res, mapping, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Mapping already exists for this subject, branch, and semester', 400);
    if (error.message.includes('not found') || error.message.includes('match')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

exports.getMappings = async (req, res, next) => {
  try {
    const mappings = await SubjectBranchMappingService.getMappings();
    return sendSuccess(res, mappings);
  } catch (error) {
    next(error);
  }
};

exports.updateMapping = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const mapping = await SubjectBranchMappingService.updateMapping(req.params.id, req.body);
    return sendSuccess(res, mapping);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Mapping already exists for this subject, branch, and semester', 400);
    if (error.message.includes('not found') || error.message.includes('match')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

exports.deleteMapping = async (req, res, next) => {
  try {
    const mapping = await SubjectBranchMappingService.deleteMapping(req.params.id);
    if (!mapping) return sendError(res, 'Mapping not found', 404);
    
    return sendSuccess(res, { message: 'Mapping deleted successfully' });
  } catch (error) {
    next(error);
  }
};
