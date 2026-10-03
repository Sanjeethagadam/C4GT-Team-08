const mongoose = require('mongoose');
const Backlog = require('../models/Backlog');
const SubjectBranchMapping = require('../../academic-master/models/SubjectBranchMapping');
const Subject = require('../../academic-master/models/Subject');
const Semester = require('../../academic-master/models/Semester');

exports.resolveHistoricalAcademicStatus = async ({ studentIds, branchId, semesterIds }) => {
  if (!semesterIds || semesterIds.length === 0) return [];
  if (!studentIds || studentIds.length === 0) return [];

  // 1. Fetch the complete subject curriculum for the branch and given semesters
  const mappings = await SubjectBranchMapping.find({
    branchId,
    semesterId: { $in: semesterIds },
    status: 'ACTIVE'
  }).populate('subjectId', 'subjectName subjectCode credits').lean();

  // 2. Fetch the backlog history for the given students and semesters
  const backlogs = await Backlog.find({
    studentId: { $in: studentIds },
    academicSemesterId: { $in: semesterIds }
  }).lean();

  const backlogSet = new Set(
    backlogs.map(b => `${b.studentId.toString()}_${b.academicSemesterId.toString()}_${b.subjectId.toString()}`)
  );

  const results = [];
  
  // 3. Construct inferred status for every student
  for (const studentId of studentIds) {
    const studentIdStr = studentId.toString();
    const processedSubjects = new Set();
    
    for (const mapping of mappings) {
      if (!mapping.subjectId) continue;
      
      const subIdStr = mapping.subjectId._id.toString();
      const subCode = mapping.subjectId.subjectCode || '';
      
      const duplicateKeyById = `${subIdStr}`;
      const duplicateKeyByCode = `code_${subCode}`;
      
      let isDuplicate = false;
      if (subIdStr) {
          isDuplicate = processedSubjects.has(duplicateKeyById);
      } else if (subCode) {
          isDuplicate = processedSubjects.has(duplicateKeyByCode);
      }

      if (isDuplicate) continue;
      
      if (subIdStr) {
          processedSubjects.add(duplicateKeyById);
      } else if (subCode) {
          processedSubjects.add(duplicateKeyByCode);
      }
      
      const semIdStr = mapping.semesterId.toString();
      const key = `${studentIdStr}_${semIdStr}_${subIdStr}`;
      const isFailed = backlogSet.has(key);
      
      results.push({
        _id: new mongoose.Types.ObjectId().toString(), // Virtual ID for React keys
        studentId: studentId,
        subjectId: mapping.subjectId,
        academicSemesterId: mapping.semesterId,
        resultStatus: isFailed ? 'FAIL' : 'PASS',
        grade: '-',
        gradePoint: '-',
        internalMarks: null,
        credits: mapping.credits !== undefined ? mapping.credits : mapping.subjectId.credits,
        isOfficial: false,
        isHistorical: true
      });
    }
  }

  return results;
};
