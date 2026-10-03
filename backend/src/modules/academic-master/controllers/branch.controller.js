const BranchService = require('../services/branch.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createBranch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const branch = await BranchService.createBranch(req.body);
    return sendSuccess(res, branch, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Branch code must be unique', 400);
    next(error);
  }
};

exports.getBranches = async (req, res, next) => {
  try {
    const branches = await BranchService.getBranches();
    return sendSuccess(res, branches);
  } catch (error) {
    next(error);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const branch = await BranchService.updateBranch(req.params.id, req.body);
    if (!branch) return sendError(res, 'Branch not found', 404);
    
    return sendSuccess(res, branch);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Branch code must be unique', 400);
    next(error);
  }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await BranchService.deleteBranch(req.params.id);
    if (!branch) return sendError(res, 'Branch not found', 404);
    
    return sendSuccess(res, { message: 'Branch deleted successfully' });
  } catch (error) {
    next(error);
  }
};
