const CampusService = require('../services/campus.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createCampus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const campus = await CampusService.createCampus(req.body);
    return sendSuccess(res, campus, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Campus code must be unique', 400);
    next(error);
  }
};

exports.getCampuses = async (req, res, next) => {
  try {
    const campuses = await CampusService.getCampuses();
    return sendSuccess(res, campuses);
  } catch (error) {
    next(error);
  }
};

exports.updateCampus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const campus = await CampusService.updateCampus(req.params.id, req.body);
    if (!campus) return sendError(res, 'Campus not found', 404);
    
    return sendSuccess(res, campus);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Campus code must be unique', 400);
    next(error);
  }
};

exports.deleteCampus = async (req, res, next) => {
  try {
    const campus = await CampusService.deleteCampus(req.params.id);
    if (!campus) return sendError(res, 'Campus not found', 404);
    
    return sendSuccess(res, { message: 'Campus deleted successfully' });
  } catch (error) {
    next(error);
  }
};
