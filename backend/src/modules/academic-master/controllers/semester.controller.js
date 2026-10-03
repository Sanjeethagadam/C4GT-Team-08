const SemesterService = require('../services/semester.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createSemester = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const semester = await SemesterService.createSemester(req.body);
    return sendSuccess(res, semester, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Semester code already exists for this academic year', 400);
    if (error.message === 'Academic year not found') return sendError(res, error.message, 400);
    next(error);
  }
};

exports.getSemesters = async (req, res, next) => {
  try {
    const semesters = await SemesterService.getSemesters();
    return sendSuccess(res, semesters);
  } catch (error) {
    next(error);
  }
};

exports.updateSemester = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const semester = await SemesterService.updateSemester(req.params.id, req.body);
    if (!semester) return sendError(res, 'Semester not found', 404);
    
    return sendSuccess(res, semester);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Semester code already exists for this academic year', 400);
    if (error.message === 'Academic year not found') return sendError(res, error.message, 400);
    next(error);
  }
};
