const analyticsService = require('../services/analytics.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');

const CtpoAssignment = require('../../examination/models/CtpoAssignment');

const getBaseQueryFromScope = async (user, reqQuery) => {
  const query = {};
  
  // Apply Request Filters (only if allowed by scope)
  if (reqQuery.campusId) query.campusId = reqQuery.campusId;
  if (reqQuery.branchId) query.branchId = reqQuery.branchId;
  if (reqQuery.academicYearId) query.academicYearId = reqQuery.academicYearId;
  if (reqQuery.year) query.year = Number(reqQuery.year);
  if (reqQuery.semesterCode) query.semesterCode = reqQuery.semesterCode;
  if (reqQuery.academicSemesterId) query.academicSemesterId = reqQuery.academicSemesterId;
  if (reqQuery.sectionId) query.sectionId = reqQuery.sectionId;

  // Apply RBAC Constraints
  if (user.role === 'PRINCIPAL') {
    // Principal can see everything
  } else if (user.role === 'CTPO') {
    // CTPO is scoped by assignment
    const assignment = await CtpoAssignment.findOne({ ctpoUserId: user.id || user._id, status: 'ACTIVE' });
    if (assignment) {
      query.sectionId = assignment.sectionId.toString();
      query.branchId = assignment.branchId.toString();
      // Ensure they don't override their scope
      if (reqQuery.sectionId) query.sectionId = assignment.sectionId.toString();
    } else {
      // No active assignment, should see nothing
      query._id = '000000000000000000000000'; // Force 0 results
    }
  } else if (user.role === 'HOD') {
    if (user.scope && user.scope.year) {
      query.year = Number(user.scope.year); // strict enforcement
    } else if (reqQuery.year) {
      query.year = Number(reqQuery.year);
    }
    if (user.scopeRef && user.scopeRef.type === 'Branch') {
      query.branchId = user.scopeRef.refId.toString();
    } else if (user.scope && user.scope.branchId) {
      query.branchId = user.scope.branchId.toString();
    }
  } else if (user.role === 'COORDINATOR') {
    // Coordinator might be scoped to a branch or nothing
    if (user.scopeRef && user.scopeRef.type === 'Branch') {
      query.branchId = user.scopeRef.refId.toString();
    }
  } else if (user.role === 'STUDENT') {
    if (user.scopeRef && user.scopeRef.refId) {
       query._id = user.scopeRef.refId.toString();
    } else {
       query._id = '000000000000000000000000';
    }
  }
  
  return query;
};

exports.getCampusKPIs = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getCampusKPIs(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getAcademicTrends = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getAcademicTrends(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getResultsDistribution = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getResultsDistribution(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getBacklogsDistribution = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getBacklogsDistribution(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getRiskDistribution = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getRiskDistribution(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getRemedialStats = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getRemedialStats(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getGuestLectureStats = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getGuestLectureStats(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getStudentPersonalAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return sendError(res, 'Forbidden', 403);
    }
    const studentId = req.user.scopeRef ? req.user.scopeRef.refId : null;
    if (!studentId) {
      return sendError(res, 'Student ID not found in user scope', 400);
    }
    const data = await analyticsService.getStudentPersonalAnalytics(studentId);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getHistoricalStudents = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getHistoricalStudents(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return sendError(res, 'Forbidden', 403);
    }
    const data = await analyticsService.getAdminDashboard();
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getBranchesPerformance = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getBranchesPerformance(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.getYearsPerformance = async (req, res) => {
  try {
    const query = await getBaseQueryFromScope(req.user, req.query);
    const data = await analyticsService.getYearsPerformance(query);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
