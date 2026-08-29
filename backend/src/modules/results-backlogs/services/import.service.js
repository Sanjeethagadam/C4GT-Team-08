const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Student = require('../../academic-master/models/Student');
const Subject = require('../../academic-master/models/Subject');
const Semester = require('../../academic-master/models/Semester');
const Result = require('../models/Result');
const Backlog = require('../models/Backlog');
const resultService = require('./result.service');

exports.processImport = async (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  let successCount = 0;
  let failureCount = 0;
  let errors = [];
  let mismatchWarnings = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // header is row 1
    
    try {
      const { rollNo, subjectCode, semesterCode, resultStatus, grade, source, reportedBacklogCount } = row;

      if (!rollNo || !subjectCode || !semesterCode || !resultStatus) {
        throw new Error('Missing required fields: rollNo, subjectCode, semesterCode, resultStatus');
      }

      // Lookups
      const student = await Student.findOne({ rollNo });
      if (!student) throw new Error(`Invalid rollNo: ${rollNo}`);

      const subject = await Subject.findOne({ subjectCode });
      if (!subject) throw new Error(`Invalid subjectCode: ${subjectCode}`);

      const semester = await Semester.findOne({ semesterCode });
      if (!semester) throw new Error(`Invalid semesterCode: ${semesterCode}`);

      // Check duplicate result
      const existingResult = await Result.findOne({
        studentId: student._id,
        subjectId: subject._id,
        semesterId: semester._id
      });
      if (existingResult) throw new Error('Duplicate result already exists for this combination');

      // Execute standard Result creation (this safely invokes the auto-backlog logic in Phase 5)
      await resultService.processResult({
        studentId: student._id,
        subjectId: subject._id,
        semesterId: semester._id,
        resultStatus,
        grade: grade || 'N/A',
        source: source || 'IMPORT'
      });

      // Mismatch calculation
      if (reportedBacklogCount !== undefined) {
        const actualBacklogs = await Backlog.countDocuments({ studentId: student._id, status: 'ACTIVE' });
        // The imported file typically tracks cumulative backlogs or specific context.
        if (Number(reportedBacklogCount) !== actualBacklogs) {
          mismatchWarnings.push(`Row ${rowNum}: ${rollNo} derived backlog count (${actualBacklogs}) does not match reported (${reportedBacklogCount})`);
        }
      }

      successCount++;
    } catch (err) {
      failureCount++;
      errors.push(`Row ${rowNum}: ${err.message}`);
    }
  }

  return { totalProcessed: data.length, successCount, failureCount, errors, mismatchWarnings };
};
