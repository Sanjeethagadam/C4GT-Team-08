const SubjectService = require('../services/subject.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createSubject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const subject = await SubjectService.createSubject(req.body);
    return sendSuccess(res, subject, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Subject code already exists', 400);
    if (error.message === 'Semester not found') return sendError(res, error.message, 400);
    next(error);
  }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await SubjectService.getSubjects();
    return sendSuccess(res, subjects);
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const subject = await SubjectService.updateSubject(req.params.id, req.body);
    if (!subject) return sendError(res, 'Subject not found', 404);
    
    return sendSuccess(res, subject);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Subject code already exists', 400);
    if (error.message === 'Semester not found') return sendError(res, error.message, 400);
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await SubjectService.deleteSubject(req.params.id);
    if (!subject) return sendError(res, 'Subject not found', 404);
    
    return sendSuccess(res, { message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};
