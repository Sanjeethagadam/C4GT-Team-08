const UserService = require('../services/user.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const user = await UserService.createUser(req.body);
    const userObj = user.toObject();
    delete userObj.passwordHash;
    return sendSuccess(res, userObj, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Username must be unique', 400);
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getUsers();
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user) return sendError(res, 'User not found', 404);
    
    return sendSuccess(res, user);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Username must be unique', 400);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    
    return sendSuccess(res, { message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
