const StudentService = require('../services/student.service');
const { sendSuccess, sendError } = require('../../../utils/response.util');
const { validationResult } = require('express-validator');

exports.createStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const student = await StudentService.createStudent(req.body);
    return sendSuccess(res, student, 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Student roll number must be unique', 400);
    if (error.message.includes('not available') || error.message.includes('not found')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.sectionId) filter.sectionId = req.query.sectionId;
    if (req.query.branchId) filter.branchId = req.query.branchId;

    if (req.user.role === 'STUDENT') {
      const studentId = req.user.scopeRef?.refId;
      if (!studentId) {
        return sendError(res, 'Student identity missing from token', 403);
      }
      filter._id = studentId;
    } else if (req.user.role === 'CTPO') {
      const CtpoAssignment = require('../../examination/models/CtpoAssignment');
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' });
      if (assignment) {
        filter.branchId = assignment.branchId.toString();
      } else {
        filter._id = '000000000000000000000000'; // Force 0 results if no active assignment
      }
    } else if (req.user.role === 'HOD') {
      if (req.user.scope && req.user.scope.year) {
        filter.year = Number(req.user.scope.year);
      }
      if (req.user.scopeRef) {
        if (req.user.scopeRef.type === 'Campus') filter.campusId = req.user.scopeRef.refId;
        if (req.user.scopeRef.type === 'Branch') filter.branchId = req.user.scopeRef.refId;
      }
    } else if (req.user.scopeRef) {
      if (req.user.scopeRef.type === 'Campus') filter.campusId = req.user.scopeRef.refId;
      if (req.user.scopeRef.type === 'Branch') filter.branchId = req.user.scopeRef.refId;
    }

    const students = await StudentService.getStudents(filter);
    return sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await StudentService.getStudentById(req.params.id);
    if (!student) return sendError(res, 'Student not found', 404);
    
    if (req.user.role === 'HOD') {
      if (req.user.scope && req.user.scope.year) {
        if (student.year !== Number(req.user.scope.year)) {
          return sendError(res, 'Forbidden: Student is outside your assigned year scope', 403);
        }
      }
      if (req.user.scopeRef && req.user.scopeRef.type === 'Branch') {
        const studentBranchId = student.branchId?._id?.toString() || student.branchId?.toString();
        const scopeBranchId = req.user.scopeRef.refId?.toString();
        if (studentBranchId && scopeBranchId && studentBranchId !== scopeBranchId) {
          return sendError(res, 'Forbidden: Student is outside your assigned branch scope', 403);
        }
      }
    }
    return sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const studentId = req.user.scopeRef?.refId;
    if (!studentId) return sendError(res, 'Student profile reference not found in authenticated token', 400);
    
    const student = await StudentService.getStudentById(studentId);
    if (!student) return sendError(res, 'Student profile not found', 404);
    
    return sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation Error', 400, errors.array());

    const student = await StudentService.updateStudent(req.params.id, req.body);
    if (!student) return sendError(res, 'Student not found', 404);
    
    return sendSuccess(res, student);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Student roll number must be unique', 400);
    if (error.message.includes('not available') || error.message.includes('not found')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await StudentService.deleteStudent(req.params.id);
    if (!student) return sendError(res, 'Student not found', 404);
    
    return sendSuccess(res, { message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getInternalStudentById = async (req, res, next) => {
  try {
    const student = await StudentService.getStudentById(req.params.id);
    if (!student) return sendError(res, 'Student not found', 404);
    
    // Return only requested fields
    return sendSuccess(res, {
      rollNo: student.rollNo,
      name: student.name,
      campusId: student.campusId,
      branchId: student.branchId,
      year: student.year,
      semesterId: student.semesterId,
      sectionId: student.sectionId
    });
  } catch (error) {
    next(error);
  }
};
