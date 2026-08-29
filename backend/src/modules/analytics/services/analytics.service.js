const mongoose = require('mongoose');
const { buildScopeFilter } = require('../utils/scopeBuilder');
const Result = require('../../results-backlogs/models/Result');
const Backlog = require('../../results-backlogs/models/Backlog');
const RiskProfile = require('../../results-backlogs/models/RiskProfile');
const RemedialClass = require('../../academic-support/models/RemedialClass');
const GuestLecture = require('../../academic-support/models/GuestLecture');
const Student = require('../../academic-master/models/Student');
const Mark = require('../../examination/models/Mark');

// Converts string IDs in scope filter to ObjectIds for aggregation
const sanitizeScopeForAgg = (filter) => {
  const sanitized = { ...filter };
  for (let key in sanitized) {
    if (typeof sanitized[key] === 'string' && mongoose.Types.ObjectId.isValid(sanitized[key])) {
      sanitized[key] = new mongoose.Types.ObjectId(sanitized[key]);
    }
  }
  return sanitized;
};

exports.getAcademicTrends = async (user) => {
  const scopeFilter = sanitizeScopeForAgg(buildScopeFilter(user, 'student.'));
  
  return await Mark.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    { $match: scopeFilter },
    {
      $lookup: {
        from: 'examinations',
        localField: 'examinationId',
        foreignField: '_id',
        as: 'examination'
      }
    },
    { $unwind: '$examination' },
    {
      $group: {
        _id: '$examination.examinationType',
        averageMarks: { $avg: '$marks' },
        totalEntries: { $sum: 1 }
      }
    }
  ]);
};

exports.getResultsDistribution = async (user) => {
  const scopeFilter = sanitizeScopeForAgg(buildScopeFilter(user, 'student.'));

  return await Result.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    { $match: scopeFilter },
    {
      $group: {
        _id: '$resultStatus',
        count: { $sum: 1 }
      }
    }
  ]);
};

exports.getBacklogsDistribution = async (user) => {
  const scopeFilter = sanitizeScopeForAgg(buildScopeFilter(user, 'student.'));

  return await Backlog.aggregate([
    { $match: { status: 'ACTIVE' } },
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    { $match: scopeFilter },
    {
      $group: {
        _id: { campusId: '$student.campusId', branchId: '$student.branchId', year: '$student.year' },
        count: { $sum: 1 }
      }
    }
  ]);
};

exports.getRiskDistribution = async (user) => {
  const scopeFilter = sanitizeScopeForAgg(buildScopeFilter(user, 'student.'));

  return await RiskProfile.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    { $match: scopeFilter },
    {
      $group: {
        _id: '$riskLevel',
        count: { $sum: 1 }
      }
    }
  ]);
};

exports.getRemedialStats = async (user) => {
  // Remedial Class isn't bound to a single student. It's bound to a campus/branch.
  // We can filter Remedial classes based on the user's explicit scope
  const filter = {};
  if (user.role === 'PRINCIPAL' && user.scope.campusId) filter.campusId = new mongoose.Types.ObjectId(user.scope.campusId);
  if (user.role === 'HOD' && user.scope.branchId) filter.branchId = new mongoose.Types.ObjectId(user.scope.branchId);

  const totalClasses = await RemedialClass.countDocuments(filter);
  return { totalClasses };
};

exports.getGuestLectureStats = async (user) => {
  const filter = {};
  if (user.role === 'PRINCIPAL' && user.scope.campusId) filter.campusId = new mongoose.Types.ObjectId(user.scope.campusId);
  if (user.role === 'HOD' && user.scope.branchId) filter.branchId = new mongoose.Types.ObjectId(user.scope.branchId);

  const totalLectures = await GuestLecture.countDocuments(filter);
  return { totalLectures };
};

exports.getCampusKPIs = async (user) => {
  const scopeFilter = sanitizeScopeForAgg(buildScopeFilter(user));
  
  const totalStudents = await Student.countDocuments(scopeFilter);
  
  // Reuse existing aggregates for KPIs
  const activeBacklogs = await this.getBacklogsDistribution(user);
  const totalBacklogs = activeBacklogs.reduce((acc, curr) => acc + curr.count, 0);

  return { totalStudents, totalBacklogs };
};
