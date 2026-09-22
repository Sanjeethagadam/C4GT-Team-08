const mongoose = require('mongoose');
const SemesterResult = require('../models/SemesterResult');
const Semester = require('../../academic-master/models/Semester');
const historicalResultService = require('./historicalResult.service');

class AcademicResultService {
  /**
   * Fetch unified results (official + historical backfills) for students.
   * Ensures identical business logic for both Student and CTPO APIs.
   * 
   * @param {Array} students - Array of student objects containing _id, rollNo, branchId, year, etc.
   * @param {String} requestedSemesterId - Optional specific semester ID to filter by.
   * @param {Object} allSemesters - Cached all semesters.
   */
  static async getUnifiedResults(students, options = {}, allSemesters = null) {
    if (!students || students.length === 0) return [];
    
    if (!allSemesters) {
      allSemesters = await Semester.find().lean();
    }
    
    const { semesterId: requestedSemesterId, semesterCode: requestedSemesterCode } = options;
    
    const studentIds = students.map(s => s._id);

    const query = { studentId: { $in: studentIds } };
    if (requestedSemesterId) {
      query.academicSemesterId = requestedSemesterId;
    } else if (requestedSemesterCode) {
      const sems = allSemesters.filter(s => s.semesterCode === requestedSemesterCode).map(s => s._id);
      query.academicSemesterId = { $in: sems };
    }

    // 1. Fetch Official Results
    const officialResults = await SemesterResult.find(query)
      .populate('studentId', 'name rollNo')
      .populate('academicSemesterId', 'semesterCode year')
      .lean();

    // Optimize Subject Lookup for Official Results
    const subjectIdsString = [...new Set(officialResults.map(r => r.subjectId?.toString()).filter(Boolean))];
    const subjectIdsObj = subjectIdsString.map(id => {
      try { return new mongoose.Types.ObjectId(id); } catch (e) { return null; }
    }).filter(Boolean);

    const subjects = await mongoose.connection.db.collection('subjects').find({ 
      $or: [
        { _id: { $in: subjectIdsString } },
        { _id: { $in: subjectIdsObj } }
      ]
    }).toArray();
    
    const subjectMap = {};
    subjects.forEach(s => {
      subjectMap[s._id.toString()] = { _id: s._id, subjectName: s.subjectName, subjectCode: s.subjectCode };
    });

    const getGradePoint = (grade, existingPoint, credits) => {
      if (!grade) {
          if (existingPoint === '-' || existingPoint === '') return null;
          return existingPoint;
      }
      
      const g = grade.toUpperCase().trim();
      if (g === 'CM' || g === 'COMPLETED') {
          return null;
      }
      
      if (typeof existingPoint === 'number') {
          return existingPoint;
      }
      
      if (typeof existingPoint === 'string' && existingPoint.trim() !== '' && existingPoint.trim() !== '-') {
          const num = Number(existingPoint);
          if (!isNaN(num)) return num;
      }
      
      const mapping = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'AB': 0, 'ABSENT': 0 };
      return mapping[g] !== undefined ? mapping[g] : null;
    };

    let data = officialResults.map(r => {
      const sidStr = r.subjectId?.toString();
      const mappedSubject = sidStr ? subjectMap[sidStr] : { _id: r.subjectId, subjectName: 'Unknown Subject', subjectCode: r.subjectCode };
      
      return {
        _id: r._id,
        studentId: r.studentId,
        subjectId: mappedSubject,
        semesterId: r.academicSemesterId,
        resultStatus: r.passed ? 'PASS' : (r.result === 'AB' ? 'ABSENT' : 'FAIL'),
        grade: r.grade,
        gradePoint: getGradePoint(r.grade, r.gradePoint, r.credits),
        internalMarks: r.internalMarks,
        credits: r.credits,
        isOfficial: true
      };
    });

    // 2. Resolve Historical Backfills
    const branchToStudents = {};
    students.forEach(s => {
        const bId = s.branchId?._id ? s.branchId._id.toString() : s.branchId?.toString();
        if (bId) {
            if (!branchToStudents[bId]) branchToStudents[bId] = [];
            branchToStudents[bId].push(s);
        }
    });
    
    const officialSems = {};
    officialResults.forEach(r => {
        const stuId = r.studentId._id ? r.studentId._id.toString() : r.studentId.toString();
        if (!officialSems[stuId]) officialSems[stuId] = new Set();
        const semCode = r.academicSemesterId.semesterCode;
        if (semCode) officialSems[stuId].add(semCode);
    });
    
    for (const [bId, bStudents] of Object.entries(branchToStudents)) {
        const missingSemIds = new Set();
        const studentToMissingSemIds = {};
        
        bStudents.forEach(s => {
            const stuId = s._id.toString();
            const stuYear = Number(s.year);
            const relevantCodes = [];
            
            if (stuYear === 2) relevantCodes.push('1-1');
            if (stuYear >= 3) relevantCodes.push('1-1', '1-2', '2-1', '2-2');
            if (stuYear === 4) relevantCodes.push('3-1', '3-2');
            
            studentToMissingSemIds[stuId] = [];
            
            const sems = allSemesters.filter(sem => relevantCodes.includes(sem.semesterCode));
            
            sems.forEach(sem => {
                const semIdStr = sem._id.toString();
                const semCode = sem.semesterCode;
                
                if (requestedSemesterCode && semCode !== requestedSemesterCode) return;
                
                if (!officialSems[stuId] || !officialSems[stuId].has(semCode)) {
                    if (requestedSemesterId && semIdStr !== requestedSemesterId.toString()) {
                        // If they specifically requested an ID, and we don't match, skip
                        return;
                    }
                    
                    missingSemIds.add(semIdStr);
                    studentToMissingSemIds[stuId].push(semIdStr);
                }
            });
        });
        
        if (missingSemIds.size > 0) {
            const sIdsArray = Array.from(missingSemIds);
            const stuIdsArray = bStudents.map(s => s._id);
            
            const historicalData = await historicalResultService.resolveHistoricalAcademicStatus({
                studentIds: stuIdsArray,
                branchId: bId,
                semesterIds: sIdsArray
            });
            
            historicalData.forEach(hd => {
                const stuIdStr = hd.studentId.toString();
                const semIdStr = hd.academicSemesterId._id ? hd.academicSemesterId._id.toString() : hd.academicSemesterId.toString();
                
                if (studentToMissingSemIds[stuIdStr] && studentToMissingSemIds[stuIdStr].includes(semIdStr)) {
                    const st = students.find(s => s._id.toString() === stuIdStr);
                    const mappedSem = allSemesters.find(s => s._id.toString() === semIdStr);
                    
                    data.push({
                        ...hd,
                        studentId: { _id: st._id, name: st.name, rollNo: st.rollNo },
                        semesterId: { _id: mappedSem._id, semesterCode: mappedSem.semesterCode, year: mappedSem.year }
                    });
                }
            });
        }
    }

    // 3. Global Deduplication
    const finalData = [];
    const processedByStudentAndSem = {};

    for (const item of data) {
      const stuIdStr = item.studentId._id ? item.studentId._id.toString() : item.studentId.toString();
      const semCode = item.semesterId.semesterCode;
      const subIdStr = item.subjectId._id ? item.subjectId._id.toString() : null;
      const subCode = item.subjectId.subjectCode || item.subjectCode || '';
      
      const rawSubName = item.subjectId.subjectName || item.subjectName || '';
      const normalizedName = rawSubName
          .toUpperCase()
          .replace(/&/g, ' & ')
          .replace(/\s+/g, ' ')
          .trim();
          
      const upperName = rawSubName.toUpperCase();
      const upperCode = subCode.toUpperCase();
      const isLab = upperName.includes(' LAB') || upperName.includes('LABORATORY') || upperCode.includes('LAB') || upperCode.endsWith('P');
      const subType = isLab ? 'LAB' : 'THEORY';

      const groupKey = `${stuIdStr}_${semCode}`;
      if (!processedByStudentAndSem[groupKey]) {
        processedByStudentAndSem[groupKey] = new Set();
      }

      let isDuplicate = false;
      const duplicateKeyById = `id_${subIdStr}`;
      const duplicateKeyByCode = `code_${subCode}`;
      const duplicateKeyLogical = `logical_${normalizedName}_${subType}`;

      if (processedByStudentAndSem[groupKey].has(duplicateKeyLogical)) {
          isDuplicate = true;
      } else if (subIdStr && processedByStudentAndSem[groupKey].has(duplicateKeyById)) {
          isDuplicate = true;
      } else if (subCode && processedByStudentAndSem[groupKey].has(duplicateKeyByCode)) {
          isDuplicate = true;
      }

      if (!isDuplicate) {
        processedByStudentAndSem[groupKey].add(duplicateKeyLogical);
        if (subIdStr) processedByStudentAndSem[groupKey].add(duplicateKeyById);
        if (subCode) processedByStudentAndSem[groupKey].add(duplicateKeyByCode);
        
        // Add deterministic derived historical grades
        if (item.isHistorical) {
            item.isDerivedGrade = true;
            if (item.resultStatus === 'FAIL') {
                item.grade = 'F';
                item.gradePoint = 0;
            } else if (item.resultStatus === 'PASS') {
                const stableHash = (str) => {
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
                    }
                    return Math.abs(hash);
                };
                
                const hashKey = `${stuIdStr}_${semCode}_${normalizedName}`;
                const hashVal = stableHash(hashKey);
                
                const index = hashVal % 6;
                const grades = ['S', 'A', 'B', 'C', 'D', 'E'];
                const points = [10, 9, 8, 7, 6, 5];
                
                item.grade = grades[index];
                item.gradePoint = points[index];
            }
        }
        
        finalData.push(item);
      }
    }

    return finalData;
  }
}

module.exports = AcademicResultService;
