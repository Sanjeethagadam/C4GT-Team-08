const AcademicYearService = require('../services/academicYear.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createAcademicYear = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const { startDate, endDate } = req.body;
    if (new Date(startDate) >= new Date(endDate)) {
      return sendError(res, 'startDate must be before endDate', 400);
    }

    const year = await AcademicYearService.createAcademicYear(req.body);
    return sendSuccess(res, year, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Academic year code already exists', 400);
    next(error);
  }
};

exports.getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYearService.getAcademicYears();
    return sendSuccess(res, years);
  } catch (error) {
    next(error);
  }
};

exports.updateAcademicYear = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const { startDate, endDate } = req.body;
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return sendError(res, 'startDate must be before endDate', 400);
    }

    const year = await AcademicYearService.updateAcademicYear(req.params.id, req.body);
    if (!year) return sendError(res, 'Academic year not found', 404);
    
    return sendSuccess(res, year);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Academic year code already exists', 400);
    if (error.name === 'ValidationError') return sendError(res, error.message, 400);
    next(error);
  }
};

exports.deleteAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYearService.deleteAcademicYear(req.params.id);

    if (!year) {
      return sendError(res, 'Academic year not found', 404);
    }

    return sendSuccess(res, {
      message: 'Academic year removed successfully',
      id: req.params.id,
    });
  } catch (error) {
    if (error.code === 'ACADEMIC_YEAR_IN_USE') {
      return sendError(res, error.message, 409);
    }

    next(error);
  }
};
