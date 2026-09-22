const Student = require('../../academic-master/models/Student');
const SemesterResult = require('../../results-backlogs/models/SemesterResult');
const Backlog = require('../../results-backlogs/models/Backlog');
const Marks = require('../../examination/models/Marks');
const RemedialClass = require('../../academic-support/models/RemedialClass');
const GuestLecture = require('../../academic-support/models/GuestLecture');
const Semester = require('../../academic-master/models/Semester');
const mongoose = require('mongoose');

class AnalyticsService {
  _getStudentQuery(query) {
    const objectIdFields = ['campusId', 'branchId', 'sectionId', '_id'];
    const formattedQuery = {};
    for (const key in query) {
      if (key === 'sectionId' && query[key] === 'unassigned') {
        formattedQuery[key] = null;
      } else if (objectIdFields.includes(key) && mongoose.Types.ObjectId.isValid(query[key])) {
        formattedQuery[key] = new mongoose.Types.ObjectId(query[key]);
      } else if (key === 'year') {
        formattedQuery[key] = Number(query[key]);
      }
    }
    return formattedQuery;
  }

  async getCampusKPIs(query) {
    const studentQuery = this._getStudentQuery(query);
    
    let totalStudents = 0;
    let historicalStudentIds = null;
    if (query.academicSemesterId) {
      // Historical scoping: Count distinct students who participated in this exact semester
      const historicalStudents = await this.getHistoricalStudents(query);
      historicalStudentIds = historicalStudents.map(s => s._id);
      totalStudents = historicalStudents.length;
    } else {
      totalStudents = await Student.countDocuments(studentQuery);
    }
    
    const branchMatch = historicalStudentIds 
        ? { _id: { $in: historicalStudentIds } } 
        : studentQuery;

    const studentBranches = await Student.aggregate([
      { $match: branchMatch },
      { $group: { _id: '$branchId', count: { $sum: 1 } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: '$branch' },
      { $project: { _id: 0, branchCode: '$branch.code', branchName: '$branch.name', count: 1 } },
      { $sort: { branchCode: 1 } }
    ]);

    const studentYearsAgg = await Student.aggregate([
      { $match: branchMatch },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const studentYears = studentYearsAgg.map(y => ({ year: y._id, count: y.count }));

    let backlogMatch = { status: 'ACTIVE' };
    let backlogPipeline = [];
    if (query.academicSemesterId && historicalStudentIds) {
       backlogMatch.academicSemesterId = new mongoose.Types.ObjectId(query.academicSemesterId);
       backlogMatch.studentId = { $in: historicalStudentIds };
       backlogPipeline = [ { $match: backlogMatch } ];
    } else {
       backlogPipeline = [
         { $match: backlogMatch },
         { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
         { $unwind: '$student' },
         { $match: Object.keys(studentQuery).reduce((acc, key) => { acc[`student.${key}`] = studentQuery[key]; return acc; }, {}) }
       ];
    }

    const backlogAgg = await Backlog.aggregate([
      ...backlogPipeline,
      {
        $facet: {
          total: [{ $count: 'count' }],
          students: [
            { $group: { _id: '$studentId' } },
            { $count: 'count' }
          ],
          branches: [
            { $group: { _id: '$student.branchId', count: { $sum: 1 } } },
            { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
            { $unwind: '$branch' },
            { $project: { _id: 0, branchCode: '$branch.code', branchName: '$branch.name', count: 1 } },
            { $sort: { branchCode: 1 } }
          ],
          years: [
            { $group: { _id: '$student.year', count: { $sum: 1 } } },
            { $project: { _id: 0, year: '$_id', count: 1 } },
            { $sort: { year: 1 } }
          ]
        }
      }
    ]);

    const activeBacklogSubjects = backlogAgg[0].total[0] ? backlogAgg[0].total[0].count : 0;
    const studentsWithActiveBacklogs = backlogAgg[0].students && backlogAgg[0].students[0] ? backlogAgg[0].students[0].count : 0;
    const backlogBranches = backlogAgg[0].branches;
    const backlogYears = backlogAgg[0].years;

    const User = require('../../academic-master/models/User');
    const activeUsers = await User.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } });

    return {
      totalStudents,
      activeUsers,
      activeBacklogSubjects,
      studentsWithActiveBacklogs,
      studentBranches,
      studentYears,
      backlogBranches,
      backlogYears
    };
  }

  async getAcademicTrends(query) {
    const studentQuery = this._getStudentQuery(query);
    let matchStage = {};
    if (query.academicSemesterId) {
       const historicalStudents = await this.getHistoricalStudents(query);
       if (historicalStudents.length === 0) return { trends: [], distribution: [], kpis: null, availableSemesters: [] };
       matchStage.studentId = { $in: historicalStudents.map(s => s._id) };
    } else {
       if (Object.keys(studentQuery).length > 0) {
         const students = await Student.find(studentQuery, '_id');
         if (students.length === 0) return { trends: [], distribution: [], kpis: null, availableSemesters: [] };
         matchStage.studentId = { $in: students.map(s => s._id) };
       }
    }

    let examMatchStage = {};
    // Restrict to the exact cohort if year is provided in the query
    if (query.year && !query.academicSemesterId) {
        const AcademicYear = require('../../academic-master/models/AcademicYear');
        const cohort = await AcademicYear.findOne({ academicYear: `Year ${query.year}` });
        if (cohort) {
            examMatchStage['exam.academicYearId'] = cohort._id;
        }
    }

    if (query.academicSemesterId) {
        examMatchStage['exam.semesterId'] = new mongoose.Types.ObjectId(query.academicSemesterId);
    } else if (query.semesterCode) {
        const sems = await Semester.find({ semesterCode: query.semesterCode });
        if (sems.length > 0) examMatchStage['exam.semesterId'] = { $in: sems.map(s => s._id) };
    } else if (query.year) {
        const sems = await Semester.find({ year: Number(query.year) });
        if (sems.length > 0) examMatchStage['exam.semesterId'] = { $in: sems.map(s => s._id) };
    }

    const marksAgg = await Marks.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'examinations', localField: 'examinationId', foreignField: '_id', as: 'exam' } },
      { $unwind: '$exam' },
      { $match: examMatchStage },
      { $project: {
          studentId: 1,
          examType: '$exam.examType',
          marksObtained: 1,
          maxMarks: 1,
          percentage: { $cond: [{ $eq: ['$maxMarks', 0] }, 0, { $multiply: [ { $divide: ['$marksObtained', '$maxMarks'] }, 100 ] }] }
      }}
    ]);

    if (marksAgg.length === 0) return { trends: [], distribution: [], kpis: null, availableSemesters: [], targetSemesterCode: query.semesterCode || '' };

    // Trends grouping
    const typeGroup = {};
    marksAgg.forEach(m => {
      if (!typeGroup[m.examType]) typeGroup[m.examType] = { sum: 0, count: 0 };
      typeGroup[m.examType].sum += m.percentage;
      typeGroup[m.examType].count += 1;
    });

    const trends = [];
    if (typeGroup['MID1']) trends.push({ name: 'MID-1', averageMarks: typeGroup['MID1'].sum / typeGroup['MID1'].count });
    if (typeGroup['MID2']) trends.push({ name: 'MID-2', averageMarks: typeGroup['MID2'].sum / typeGroup['MID2'].count });

    // Distribution
    const distCounts = { '0-39': 0, '40-59': 0, '60-74': 0, '75-89': 0, '90-100': 0 };
    let highest = 0;
    let lowest = 100;
    let totalSum = 0;

    marksAgg.forEach(m => {
      const p = m.percentage;
      totalSum += p;
      if (p > highest) highest = p;
      if (p < lowest) lowest = p;

      if (p < 40) distCounts['0-39']++;
      else if (p < 60) distCounts['40-59']++;
      else if (p < 75) distCounts['60-74']++;
      else if (p < 90) distCounts['75-89']++;
      else distCounts['90-100']++;
    });

    const distribution = Object.keys(distCounts).map(k => ({ range: k, count: distCounts[k] }));
    const kpis = marksAgg.length > 0 ? {
      averageMarks: totalSum / marksAgg.length,
      highestAverage: highest,
      lowestAverage: lowest === 100 && highest === 0 ? 0 : lowest,
      examsRecorded: marksAgg.length
    } : null;

    return { trends, distribution, kpis, availableSemesters: [], targetSemesterCode: query.semesterCode || '' };
  }

  async getRiskDistribution(query) {
    const studentQuery = this._getStudentQuery(query);
    
    let totalStudents = 0;
    let matchStage = {};

    if (query.academicSemesterId) {
       const historicalStudents = await this.getHistoricalStudents(query);
       if (historicalStudents.length === 0) return [{ level: 'LOW', count: 0 }, { level: 'MEDIUM', count: 0 }, { level: 'HIGH', count: 0 }];
       
       const historicalStudentIds = historicalStudents.map(s => s._id);
       matchStage.studentId = { $in: historicalStudentIds };
       totalStudents = historicalStudentIds.length;
    } else {
       totalStudents = await Student.countDocuments(studentQuery);
       if (totalStudents === 0) return [{ level: 'LOW', count: 0 }, { level: 'MEDIUM', count: 0 }, { level: 'HIGH', count: 0 }];
    }

    const backlogMatch = { status: 'ACTIVE' };
    if (query.academicSemesterId) {
       backlogMatch.academicSemesterId = new mongoose.Types.ObjectId(query.academicSemesterId);
    }
    
    let pipeline = [];
    if (query.academicSemesterId) {
        pipeline.push({ $match: { ...backlogMatch, studentId: matchStage.studentId } });
    } else {
        if (Object.keys(studentQuery).length > 0) {
            const matchedStudents = await Student.find(studentQuery, '_id').lean();
            const studentIds = matchedStudents.map(s => s._id);
            pipeline.push({ $match: { ...backlogMatch, studentId: { $in: studentIds } } });
        } else {
            pipeline.push({ $match: backlogMatch });
        }
    }

    pipeline.push({ $group: { _id: '$studentId', count: { $sum: 1 } } });
    pipeline.push({
        $group: {
            _id: {
                $switch: {
                    branches: [
                        { case: { $lte: ['$count', 1] }, then: 'LOW' },
                        { case: { $lte: ['$count', 4] }, then: 'MEDIUM' }
                    ],
                    default: 'HIGH'
                }
            },
            studentsCount: { $sum: 1 }
        }
    });

    const results = await Backlog.aggregate(pipeline);
    
    let low = 0, medium = 0, high = 0;
    let studentsWithBacklogs = 0;
    
    results.forEach(r => {
        if (r._id === 'LOW') low += r.studentsCount;
        else if (r._id === 'MEDIUM') medium += r.studentsCount;
        else if (r._id === 'HIGH') high += r.studentsCount;
        studentsWithBacklogs += r.studentsCount;
    });

    low += (totalStudents - studentsWithBacklogs);

    return [
      { level: 'LOW', count: low },
      { level: 'MEDIUM', count: medium },
      { level: 'HIGH', count: high }
    ];
  }

  async getResultsDistribution(query) {
    const studentQuery = this._getStudentQuery(query);
    let matchStage = {};
    if (query.academicSemesterId) {
       const historicalStudents = await this.getHistoricalStudents(query);
       if (historicalStudents.length === 0) return { availableSemesters: [], targetSemesterCode: query.semesterCode || '', kpis: null, distribution: [], subjectDistribution: [], gradeDistribution: [], trend: [], backlogTrend: [] };
       matchStage.studentId = { $in: historicalStudents.map(s => s._id) };
    } else {
       if (Object.keys(studentQuery).length > 0) {
         const students = await Student.find(studentQuery, '_id');
         if (students.length === 0) return { availableSemesters: [], targetSemesterCode: query.semesterCode || '', kpis: null, distribution: [], subjectDistribution: [], gradeDistribution: [], trend: [], backlogTrend: [] };
         matchStage.studentId = { $in: students.map(s => s._id) };
       }
    }

    let currentSemesterMatch = { ...matchStage };
    let maxYear = 1;
    if (query.year) {
        maxYear = parseInt(query.year);
    } else if (Object.keys(studentQuery).length > 0) {
        const studentYears = await Student.distinct('year', studentQuery);
        if (studentYears.length > 0) maxYear = Math.max(...studentYears);
    } else {
        maxYear = 4;
    }

    let availableSemesters = [];
    if (maxYear === 1) availableSemesters = ['1-1', '1-2'];
    else if (maxYear === 2) availableSemesters = ['1-1', '1-2', '2-1', '2-2'];
    else if (maxYear === 3) availableSemesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
    else if (maxYear >= 4) availableSemesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

    let targetSemesterCode = query.semesterCode || '';

    if (query.academicSemesterId) {
        currentSemesterMatch.academicSemesterId = new mongoose.Types.ObjectId(query.academicSemesterId);
    } else if (query.semesterCode) {
        const sems = await Semester.find({ semesterCode: query.semesterCode });
        if (sems.length > 0) currentSemesterMatch.academicSemesterId = { $in: sems.map(s => s._id) };
    } else if (query.year) {
        const sems = await Semester.find({ year: Number(query.year) });
        if (sems.length > 0) currentSemesterMatch.academicSemesterId = { $in: sems.map(s => s._id) };
    }

    // 1. Current Semester Distribution - Optimized with Database Aggregation
    const resultsAgg = await SemesterResult.aggregate([
      { $match: currentSemesterMatch },
      { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          totalCounts: [
            {
              $group: {
                _id: null,
                passCount: { $sum: { $cond: ['$passed', 1, 0] } },
                failCount: { $sum: { $cond: ['$passed', 0, 1] } },
                totalRecords: { $sum: 1 },
                studentsSet: { $addToSet: '$studentId' },
                subjectsSet: { $addToSet: '$subjectId' }
              }
            }
          ],
          gradeDist: [
            { $match: { grade: { $exists: true, $ne: null } } },
            { $group: { _id: '$grade', count: { $sum: 1 } } }
          ],
          subjectWiseDist: [
            {
              $group: {
                _id: { $ifNull: ['$subject.subjectName', 'Unknown'] },
                pass: { $sum: { $cond: ['$passed', 1, 0] } },
                fail: { $sum: { $cond: ['$passed', 0, 1] } }
              }
            }
          ]
        }
      }
    ]);

    const facetData = resultsAgg[0];
    const passCount = facetData.totalCounts[0]?.passCount || 0;
    const failCount = facetData.totalCounts[0]?.failCount || 0;
    const totalRecords = facetData.totalCounts[0]?.totalRecords || 0;
    const studentsSetSize = facetData.totalCounts[0]?.studentsSet?.length || 0;
    const subjectsSetSize = facetData.totalCounts[0]?.subjectsSet?.length || 0;

    const subjectDistribution = facetData.subjectWiseDist.map((s) => {
      const evaluated = s.pass + s.fail;
      const passRate = evaluated > 0 ? (s.pass / evaluated) * 100 : 0;
      return {
        subject: s._id,
        pass: s.pass,
        fail: s.fail,
        evaluated,
        passRate: parseFloat(passRate.toFixed(1))
      };
    }).sort((a, b) => b.passRate - a.passRate);

    const gradeDistribution = facetData.gradeDist.map((g) => ({
      grade: g._id, count: g.count
    }));

    // 2. Trend Across Semesters (only for semesters that actually have data)
    const trendAgg = await SemesterResult.aggregate([
        { $match: matchStage },
        { $lookup: { from: 'semesters', localField: 'academicSemesterId', foreignField: '_id', as: 'sem' } },
        { $unwind: '$sem' },
        { $match: { 'sem.semesterCode': { $in: availableSemesters } } },
        { $group: {
            _id: '$sem.semesterCode',
            total: { $sum: 1 },
            passed: { $sum: { $cond: ['$passed', 1, 0] } }
        }},
        { $sort: { _id: 1 } }
    ]);
    
    const trend = trendAgg.map(t => ({
        semester: t._id,
        passRate: t.total > 0 ? (t.passed / t.total) * 100 : 0
    }));

    // 3. Backlog Trend across available semesters
    const totalScopedStudents = await Student.countDocuments(studentQuery);
    const backlogTrendAgg = await Backlog.aggregate([
        { $match: { ...matchStage, status: 'ACTIVE' } },
        { $lookup: { from: 'semesters', localField: 'academicSemesterId', foreignField: '_id', as: 'sem' } },
        { $unwind: '$sem' },
        { $match: { 'sem.semesterCode': { $in: availableSemesters } } },
        { $group: {
            _id: { semester: '$sem.semesterCode', student: '$studentId' },
            activeBacklogs: { $sum: 1 }
        }},
        { $group: {
            _id: '$_id.semester',
            studentsWithBacklog: { $sum: 1 },
            activeBacklogs: { $sum: '$activeBacklogs' }
        }},
        { $sort: { _id: 1 } }
    ]);

    const backlogTrend = availableSemesters.map(semCode => {
        const match = backlogTrendAgg.find(b => b._id === semCode);
        const studentsWithBacklog = match ? match.studentsWithBacklog : 0;
        const activeBacklogs = match ? match.activeBacklogs : 0;
        return {
            semester: semCode,
            studentsWithBacklog,
            totalScopedStudents,
            activeBacklogs,
            backlogRate: totalScopedStudents > 0 ? (studentsWithBacklog / totalScopedStudents) * 100 : 0
        };
    });

    let status = 'AVAILABLE';
    if (totalRecords === 0) {
        const semOrder = { '1-1': 1, '1-2': 2, '2-1': 3, '2-2': 4, '3-1': 5, '3-2': 6, '4-1': 7, '4-2': 8 };
        const targetIndex = semOrder[targetSemesterCode] || 0;
        const currentIndex = availableSemesters.length > 0 ? semOrder[availableSemesters[availableSemesters.length - 1]] : 0;
        
        let anyResultsForSem = false;
        if (currentSemesterMatch.academicSemesterId) {
            anyResultsForSem = await SemesterResult.exists({ academicSemesterId: currentSemesterMatch.academicSemesterId });
        }

        if (anyResultsForSem) {
            status = 'ANNOUNCED_NOT_IMPORTED';
        } else if (targetIndex < currentIndex) {
            status = 'HISTORICAL_NOT_IMPORTED';
        } else if (maxYear === 1 && targetSemesterCode === '1-2') {
            status = 'NOT_ANNOUNCED';
        } else {
            status = 'NOT_AVAILABLE';
        }

        let backlogSnapshot = null;
        if (status === 'HISTORICAL_NOT_IMPORTED' && targetSemesterCode) {
            const backlogAgg = await Backlog.aggregate([
              { $match: { ...matchStage, status: 'ACTIVE' } },
              { $lookup: { from: 'semesters', localField: 'academicSemesterId', foreignField: '_id', as: 'sem' } },
              { $unwind: '$sem' },
              { $match: { 'sem.semesterCode': targetSemesterCode } },
              { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
              { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } }
            ]);

            if (backlogAgg.length > 0) {
                const bStudents = new Set();
                const bSubjects = new Set();
                const bSubjectCounts = {};

                backlogAgg.forEach(b => {
                    bStudents.add(b.studentId.toString());
                    if (b.subjectId) bSubjects.add(b.subjectId.toString());
                    
                    const subjName = b.subject ? b.subject.subjectName : 'Unknown';
                    bSubjectCounts[subjName] = (bSubjectCounts[subjName] || 0) + 1;
                });
                
                const topSubjects = Object.keys(bSubjectCounts)
                    .map(k => ({ subject: k, count: bSubjectCounts[k] }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
                
                const backlogRate = totalScopedStudents > 0 ? (bStudents.size / totalScopedStudents) * 100 : 0;
                
                backlogSnapshot = {
                    studentsWithBacklog: bStudents.size,
                    totalScopedStudents,
                    activeBacklogs: backlogAgg.length,
                    subjectsAffected: bSubjects.size,
                    backlogRate,
                    topSubjects
                };
            }
        }

        return {
            availableSemesters,
            targetSemesterCode,
            status,
            kpis: null,
            distribution: [],
            subjectDistribution: [],
            gradeDistribution: [],
            trend,
            backlogSnapshot,
            backlogTrend
        };
    }

    return {
      availableSemesters,
      targetSemesterCode,
      status,
      kpis: {
        studentsWithResults: studentsSetSize,
        subjectsEvaluated: subjectsSetSize,
        resultRows: totalRecords,
        passRate: totalRecords > 0 ? (passCount / totalRecords) * 100 : 0,
        failRate: totalRecords > 0 ? (failCount / totalRecords) * 100 : 0
      },
      distribution: [
        { _id: 'PASS', count: passCount },
        { _id: 'FAIL', count: failCount }
      ],
      subjectDistribution,
      gradeDistribution,
      trend,
      backlogTrend
    };
  }

  async getBacklogsDistribution(query) {
    const studentQuery = this._getStudentQuery(query);
    let matchStage = {}; 
    if (query.academicSemesterId) {
       const historicalStudents = await this.getHistoricalStudents(query);
       if (historicalStudents.length === 0) return { activeBacklogSubjects: 0, studentsWithActiveBacklogs: 0, totalEver: 0, branchDist: [], subjectDist: [], semesterDist: [], statusDist: [] };
       matchStage.studentId = { $in: historicalStudents.map(s => s._id) };
    } else {
       if (Object.keys(studentQuery).length > 0) {
         const students = await Student.find(studentQuery, '_id');
         if (students.length === 0) return { activeBacklogSubjects: 0, studentsWithActiveBacklogs: 0, totalEver: 0, branchDist: [], subjectDist: [], semesterDist: [], statusDist: [] };
         matchStage.studentId = { $in: students.map(s => s._id) };
       }
    }

    let maxYear = 1;
    if (query.year) {
        maxYear = parseInt(query.year);
    } else if (Object.keys(studentQuery).length > 0) {
        const studentYears = await Student.distinct('year', studentQuery);
        if (studentYears.length > 0) maxYear = Math.max(...studentYears);
    } else {
        maxYear = 4;
    }

    const allSems = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1'];
    let availableSemesters = [];
    if (maxYear === 1) availableSemesters = [];
    else if (maxYear === 2) availableSemesters = ['1-1'];
    else if (maxYear === 3) availableSemesters = ['1-1', '1-2', '2-1', '2-2'];
    else if (maxYear === 4) availableSemesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1'];

    const baseMatch = { ...matchStage, ...(query.academicSemesterId ? { academicSemesterId: new mongoose.Types.ObjectId(query.academicSemesterId) } : {}) };

    const semPipeline = [
      { $match: baseMatch },
      { $lookup: { from: 'semesters', localField: 'academicSemesterId', foreignField: '_id', as: 'sem' } },
      { $unwind: { path: '$sem', preserveNullAndEmptyArrays: true } },
      ...(query.academicSemesterId ? [] : [{ $match: { 'sem.semesterCode': { $in: availableSemesters } } }])
    ];

    const [statusDistRaw, semesterDistRaw, activeStatsRaw, activeTotalRaw] = await Promise.all([
      // 1. Status Dist and Total Ever
      Backlog.aggregate([
        ...semPipeline,
        { $group: { _id: { $ifNull: ['$status', 'ACTIVE'] }, count: { $sum: 1 } } }
      ]),
      
      // 2. Semester Dist
      Backlog.aggregate([
        ...semPipeline,
        { $group: { _id: { semester: { $ifNull: ['$sem.semesterCode', 'Unknown'] }, status: { $ifNull: ['$status', 'ACTIVE'] } }, count: { $sum: 1 } } }
      ]),

      // 3. Active backlogs by Subject and Branch
      Backlog.aggregate([
        ...semPipeline,
        { $match: { status: 'ACTIVE' } },
        { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
        { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'branches', localField: 'student.branchId', foreignField: '_id', as: 'branch' } },
        { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
        { $facet: {
            branchDist: [
              { $group: { _id: { $ifNull: ['$branch.code', 'Unknown'] }, count: { $sum: 1 } } }
            ],
            subjectDist: [
              { $group: { _id: { $ifNull: ['$subject.subjectName', 'Unknown'] }, count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ]
        }}
      ]),
      
      // 4. Students with Active Backlogs
      Backlog.aggregate([
        ...semPipeline,
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$studentId' } },
        { $count: 'count' }
      ])
    ]);

    const activeTotal = statusDistRaw.find(s => s._id === 'ACTIVE')?.count || 0;
    const clearedTotal = statusDistRaw.find(s => s._id === 'CLEARED')?.count || 0;
    
    const branchDist = activeStatsRaw[0]?.branchDist || [];
    const subjectDist = activeStatsRaw[0]?.subjectDist || [];
    const studentsWithActiveBacklogs = activeTotalRaw[0]?.count || 0;

    const semCounts = {};
    semesterDistRaw.forEach(s => {
       const sName = s._id.semester;
       if (!semCounts[sName]) semCounts[sName] = { active: 0, cleared: 0 };
       if (s._id.status === 'ACTIVE') semCounts[sName].active += s.count;
       else semCounts[sName].cleared += s.count;
    });

    const semesterDist = Object.keys(semCounts).sort().map(k => ({
        semester: k,
        active: semCounts[k].active,
        cleared: semCounts[k].cleared
    }));

    const statusDist = [
        { name: 'Active', count: activeTotal },
        { name: 'Cleared', count: clearedTotal }
    ];

    return {
      activeBacklogSubjects: activeTotal,
      studentsWithActiveBacklogs,
      totalEver: activeTotal + clearedTotal,
      branchDist,
      subjectDist,
      semesterDist,
      statusDist
    };
  }

  async getRemedialStats(query) {
    const remedialQuery = {};
    if (query.branchId) {
      if (mongoose.Types.ObjectId.isValid(query.branchId)) {
        remedialQuery.targetBranches = new mongoose.Types.ObjectId(query.branchId);
      }
    }
    if (query.year) remedialQuery.targetYear = Number(query.year);

    const data = await RemedialClass.aggregate([
      { $match: remedialQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    return data;
  }

  async getGuestLectureStats(query) {
    const glQuery = {};
    if (query.branchId) {
      if (mongoose.Types.ObjectId.isValid(query.branchId)) {
        glQuery.targetBranches = new mongoose.Types.ObjectId(query.branchId);
      }
    }
    if (query.year) glQuery.targetYear = Number(query.year);
    
    const data = await GuestLecture.aggregate([
      { $match: glQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    return data;
  }

  async getStudentPersonalAnalytics(studentId) {
    const backlogs = await Backlog.find({ studentId, status: 'ACTIVE' }).populate('subjectId', 'subjectName subjectCode');
    const results = await SemesterResult.find({ studentId }).populate('subjectId', 'subjectName subjectCode').populate('academicSemesterId');
    
    return {
      backlogs,
      results,
    };
  }

  async getHistoricalStudents(query) {
    if (!query.academicSemesterId) {
      return [];
    }

    const studentQuery = this._getStudentQuery(query);
    // CRITICAL COHORT RULE: Never filter historical records by current year or section.
    delete studentQuery.year;
    delete studentQuery.sectionId;
    delete studentQuery.semesterId;

    // Validate cohort semantics: Ensure the academicSemesterId belongs to the requested year cohort.
    const SemesterModel = mongoose.models.Semester || mongoose.model('Semester');
    const sem = await SemesterModel.findById(query.academicSemesterId).populate('academicYearId');
    if (!sem || !sem.academicYearId) return [];
    // Extract the cohort year number from the AcademicYear string (e.g., "Year 4" -> 4)
    // This is the actual existing database relationship that correctly and consistently identifies the cohort,
    // especially since Student.semesterId references are dangling/deleted for Year 4 students in this environment.
    const cohortYearStr = sem.academicYearId.academicYear;
    const cohortYearMatch = cohortYearStr.match(/\d+/);
    
    if (cohortYearMatch) {
      studentQuery.year = parseInt(cohortYearMatch[0], 10);
    } else if (query.year) {
      studentQuery.year = Number(query.year);
    }
    
    // Only filter the base pool by static properties like campus, branch, and the resolved cohort year.
    const matchedStudents = await Student.find(studentQuery, '_id');
    const studentIds = matchedStudents.map(s => s._id);

    if (studentIds.length === 0) return [];

    const students = await Student.find({ _id: { $in: studentIds } })
       .populate('branchId', 'code name')
       .populate('semesterId', 'semesterCode')
       .lean();
       
    // Enrich EVERY cohort student with their historical semester backlog data
    const backlogsAgg = await Backlog.aggregate([
      { $match: { 
          academicSemesterId: new mongoose.Types.ObjectId(query.academicSemesterId),
          studentId: { $in: studentIds },
          status: 'ACTIVE'
      }},
      { $group: { _id: '$studentId', count: { $sum: 1 } } }
    ]);
    const backlogMap = new Map(backlogsAgg.map(b => [b._id.toString(), b.count]));
    
    students.forEach(student => {
       const activeBacklogs = backlogMap.get(student._id.toString()) || 0;
       student.activeBacklogs = activeBacklogs;
       
       if (activeBacklogs >= 5) student.riskLevel = 'HIGH';
       else if (activeBacklogs >= 2) student.riskLevel = 'MEDIUM';
       else student.riskLevel = 'LOW';
    });
       
    return students;
  }

  async getAdminDashboard() {
    const User = mongoose.models.User || mongoose.model('User');
    const Campus = mongoose.models.Campus || mongoose.model('Campus');
    const SubjectBranchMapping = mongoose.models.SubjectBranchMapping || mongoose.model('SubjectBranchMapping');

    const [
      totalCampuses,
      totalSubjects,
      activeUsers,
      totalStudents,
      usersByRole,
      studentsByBranch,
      studentsByYear,
      riskDistribution,
      riskByYear2,
      riskByYear3,
      riskByYear4
    ] = await Promise.all([
      Campus.countDocuments({ status: 'ACTIVE' }),
      SubjectBranchMapping.aggregate([
        { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
        { $unwind: '$subject' },
        { $group: { _id: '$subject.subjectCode' } },
        { $count: 'total' }
      ]).then(res => res[0]?.total || 0),
      User.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
      Student.countDocuments(),
      User.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Student.aggregate([
        { $group: { _id: '$branchId', count: { $sum: 1 } } },
        { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
        { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, branchCode: { $ifNull: ['$branch.code', 'Unknown'] }, branchName: { $ifNull: ['$branch.name', 'Unknown'] }, count: 1 } },
        { $sort: { branchCode: 1 } }
      ]),
      Student.aggregate([
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      this.getRiskDistribution({}),
      this.getRiskDistribution({ year: 2 }),
      this.getRiskDistribution({ year: 3 }),
      this.getRiskDistribution({ year: 4 })
    ]);

    const roles = ['STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR', 'ADMIN'];
    const usersByRoleFormatted = roles.map(role => {
      const found = usersByRole.find(r => r._id === role);
      return { role, count: found ? found.count : 0 };
    });

    const years = [2, 3, 4]; // Requested only Year 2, Year 3, Year 4
    const studentsByYearFormatted = years.map(year => {
      const found = studentsByYear.find(y => y._id === year);
      return { year: `Year ${year}`, count: found ? found.count : 0 };
    });

    return {
      kpis: {
        totalCampuses,
        totalSubjects,
        activeUsers,
        totalStudents
      },
      usersByRole: usersByRoleFormatted,
      studentsByBranch,
      studentsByYear: studentsByYearFormatted,
      riskDistribution,
      riskByYear: [
        { year: 'Year 2', distribution: riskByYear2 },
        { year: 'Year 3', distribution: riskByYear3 },
        { year: 'Year 4', distribution: riskByYear4 }
      ]
    };
  }

  async getBranchesPerformance(query) {
    const studentQuery = this._getStudentQuery(query);
    
    // 1. Students by Branch
    const studentBranchAgg = await Student.aggregate([
      { $match: studentQuery },
      { $group: { _id: '$branchId', count: { $sum: 1 } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: { $ifNull: ['$branch.name', 'Unknown'] }, count: 1 } }
    ]);
    
    const matchedStudents = await Student.find(studentQuery, '_id').lean();
    const studentIds = matchedStudents.map(s => s._id);
    
    const branchIds = studentBranchAgg.map(b => b._id);
    const branchMatches = studentBranchAgg.map(b => ({
      _id: b._id ? b._id.toString() : 'Unknown',
      name: b.name,
      students: b.count,
      activeBacklogs: 0,
      atRisk: 0,
      passRate: null
    }));

    // 2. Backlogs and Risk by Branch
    const backlogAgg = await Backlog.aggregate([
      { $match: { status: 'ACTIVE', studentId: { $in: studentIds } } },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.branchId': { $in: branchIds } } },
      { $group: {
          _id: { branch: '$student.branchId', student: '$studentId' },
          count: { $sum: 1 }
      }},
      { $group: {
          _id: '$_id.branch',
          totalBacklogs: { $sum: '$count' },
          atRisk: { $sum: { $cond: [ { $gte: ['$count', 2] }, 1, 0 ] } }
      }}
    ]);

    backlogAgg.forEach(b => {
       const branchMatch = branchMatches.find(bm => bm._id === (b._id ? b._id.toString() : 'Unknown'));
       if (branchMatch) {
         branchMatch.activeBacklogs = b.totalBacklogs;
         branchMatch.atRisk = b.atRisk;
       }
    });

    // 3. Results Pass Rate by Branch
    // To calculate Pass%, we find SemesterResults for these students
    const resultsAgg = await SemesterResult.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.branchId': { $in: branchIds } } },
      { $group: {
          _id: '$student.branchId',
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
          total: { $sum: 1 }
      }}
    ]);

    resultsAgg.forEach(r => {
       const branchMatch = branchMatches.find(bm => bm._id === (r._id ? r._id.toString() : 'Unknown'));
       if (branchMatch) {
         branchMatch.passRate = r.total > 0 ? parseFloat(((r.passed / r.total) * 100).toFixed(1)) : null;
       }
    });

    return branchMatches;
  }

  async getYearsPerformance(query) {
    const studentQuery = this._getStudentQuery(query);
    const validYears = [2, 3, 4];
    
    // 1. Students by Year
    const studentYearAgg = await Student.aggregate([
      { $match: { ...studentQuery, year: { $in: validYears } } },
      { $group: { _id: '$year', count: { $sum: 1 } } }
    ]);
    
    const matchedStudents = await Student.find({ ...studentQuery, year: { $in: validYears } }, '_id').lean();
    const studentIds = matchedStudents.map(s => s._id);
    
    const yearMatches = validYears.map(y => {
      const match = studentYearAgg.find(sy => sy._id === y);
      return {
        _id: y,
        name: `Year ${y}`,
        students: match ? match.count : 0,
        activeBacklogs: 0,
        atRisk: 0,
        passRate: null,
        averageMarks: null
      };
    });

    // 2. Backlogs and Risk by Year
    const backlogAgg = await Backlog.aggregate([
      { $match: { status: 'ACTIVE', studentId: { $in: studentIds } } },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.year': { $in: validYears } } },
      { $group: {
          _id: { year: '$student.year', student: '$studentId' },
          count: { $sum: 1 }
      }},
      { $group: {
          _id: '$_id.year',
          totalBacklogs: { $sum: '$count' },
          atRisk: { $sum: { $cond: [ { $gte: ['$count', 2] }, 1, 0 ] } }
      }}
    ]);

    backlogAgg.forEach(b => {
       const yearMatch = yearMatches.find(ym => ym._id === b._id);
       if (yearMatch) {
         yearMatch.activeBacklogs = b.totalBacklogs;
         yearMatch.atRisk = b.atRisk;
       }
    });

    // 3. Results Pass Rate by Year
    const resultsAgg = await SemesterResult.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.year': { $in: validYears } } },
      { $group: {
          _id: '$student.year',
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
          total: { $sum: 1 }
      }}
    ]);

    resultsAgg.forEach(r => {
       const yearMatch = yearMatches.find(ym => ym._id === r._id);
       if (yearMatch) {
         yearMatch.passRate = r.total > 0 ? parseFloat(((r.passed / r.total) * 100).toFixed(1)) : null;
       }
    });

    // 4. Average Marks by Year
    const marksAgg = await Marks.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.year': { $in: validYears } } },
      { $project: {
          year: '$student.year',
          percentage: { $cond: [{ $eq: ['$maxMarks', 0] }, 0, { $multiply: [ { $divide: ['$marksObtained', '$maxMarks'] }, 100 ] }] }
      }},
      { $group: {
          _id: '$year',
          averageMarks: { $avg: '$percentage' }
      }}
    ]);

    marksAgg.forEach(m => {
       const yearMatch = yearMatches.find(ym => ym._id === m._id);
       if (yearMatch) {
         yearMatch.averageMarks = m.averageMarks !== null ? parseFloat(m.averageMarks.toFixed(1)) : null;
       }
    });

    return yearMatches;
  }
}

module.exports = new AnalyticsService();
