const CampusBranchAvailabilityService = require('../services/campusBranchAvailability.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createAvailability = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const result = await CampusBranchAvailabilityService.createAvailability(req.body);
    return sendSuccess(res, result, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Availability mapping already exists for this campus and branch', 400);
    if (error.message.includes('not found')) return sendError(res, error.message, 400);
    next(error);
  }
};

exports.getAvailabilities = async (req, res, next) => {
  try {
    const results = await CampusBranchAvailabilityService.getAvailabilities();
    return sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const result = await CampusBranchAvailabilityService.updateAvailability(req.params.id, req.body);
    if (!result) return sendError(res, 'Availability not found', 404);
    
    return sendSuccess(res, result);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Availability mapping already exists for this campus and branch', 400);
    if (error.message.includes('not found')) return sendError(res, error.message, 400);
    next(error);
  }
};
