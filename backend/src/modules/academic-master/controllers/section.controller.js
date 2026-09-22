const SectionService = require('../services/section.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createSection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const section = await SectionService.createSection(req.body);
    return sendSuccess(res, section, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Section already exists for this branch and year', 400);
    if (error.message === 'Branch not found') return sendError(res, error.message, 400);
    next(error);
  }
};

exports.getSections = async (req, res, next) => {
  try {
    const sections = await SectionService.getSections();
    return sendSuccess(res, sections);
  } catch (error) {
    next(error);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const section = await SectionService.updateSection(req.params.id, req.body);
    if (!section) return sendError(res, 'Section not found', 404);
    
    return sendSuccess(res, section);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Section already exists for this branch and year', 400);
    if (error.message === 'Branch not found') return sendError(res, error.message, 400);
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const section = await SectionService.deleteSection(req.params.id);
    if (!section) return sendError(res, 'Section not found', 404);
    
    return sendSuccess(res, { message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};
