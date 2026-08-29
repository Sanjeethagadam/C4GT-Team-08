const analyticsService = require('../services/analytics.service');
const { sendSuccess, sendError } = require('../../../utils/response');

exports.getAcademicTrends = async (req, res) => {
  try {
    const data = await analyticsService.getAcademicTrends(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getResultsDistribution = async (req, res) => {
  try {
    const data = await analyticsService.getResultsDistribution(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getBacklogsDistribution = async (req, res) => {
  try {
    const data = await analyticsService.getBacklogsDistribution(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getRiskDistribution = async (req, res) => {
  try {
    const data = await analyticsService.getRiskDistribution(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getRemedialStats = async (req, res) => {
  try {
    const data = await analyticsService.getRemedialStats(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getGuestLectureStats = async (req, res) => {
  try {
    const data = await analyticsService.getGuestLectureStats(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getCampusKPIs = async (req, res) => {
  try {
    const data = await analyticsService.getCampusKPIs(req.user);
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
