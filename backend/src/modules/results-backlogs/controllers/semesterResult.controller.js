const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const Student = require('../../academic-master/models/Student');
const Subject = require('../../academic-master/models/Subject');
const Semester = require('../../academic-master/models/Semester');
const SemesterResult = require('../models/SemesterResult');
const Backlog = require('../models/Backlog');
const auditService = require('../../audit/services/audit.service');
const AcademicResultService = require('../services/academicResult.service');

exports.uploadAndPreview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    
    const { academicSemesterId } = req.body;
    if (!academicSemesterId) {
       return res.status(400).json({ status: 'error', message: 'academicSemesterId is required' });
    }

    const pdfPath = req.file.path;
    const pythonScript = path.join(__dirname, '../../../../../result-processor/pdf_parser.py');
    
    exec(`python "${pythonScript}" "${pdfPath}"`, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
      fs.unlink(pdfPath, () => {});
      
      if (error) {
        console.error('Python execution error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to parse PDF' });
      }
      
      try {
        let cleanStdout = stdout.replace(/^\uFEFF/, '');
        const result = JSON.parse(cleanStdout);
        if (result.status === 'error') {
          return res.status(500).json({ status: 'error', message: result.message });
        }
        
        const targetSemester = await Semester.findById(academicSemesterId);
        if (!targetSemester) {
           return res.status(404).json({ status: 'error', message: 'Selected semester not found' });
        }
        
        const detectedSemester = result.detectedSemester; 
        
        const extractedData = result.data;
        const matched = [];
        const unmatchedRecords = [];
        const unmatchedHtnos = new Set();
        const unmatchedSubjects = new Set();
        const missingSubjectsDetails = [];
        let fCount = 0;
        let abCount = 0;
        
        const rollNos = [...new Set(extractedData.map(d => d.htno))];
        const subCodes = [...new Set(extractedData.map(d => d.subjectCode))];
        
        const students = await Student.find({ rollNo: { $in: rollNos } }, '_id rollNo branchId semesterId').populate('semesterId', 'academicYearId');
        let subjects = await Subject.find({ subjectCode: { $in: subCodes } });
        
        const allTargetSemesters = await Semester.find({ semesterCode: targetSemester.semesterCode });
        const targetSemByAY = {};
        allTargetSemesters.forEach(s => {
            targetSemByAY[s.academicYearId.toString()] = s._id;
        });
        
        const studentMap = {};
        students.forEach(s => studentMap[s.rollNo] = s);
        
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.subjectCode] = s);

        const missingSubCodes = subCodes.filter(c => !subjectMap[c]);
        for (const code of missingSubCodes) {
            const row = extractedData.find(d => d.subjectCode === code);
            if (row) {
                missingSubjectsDetails.push({ subjectCode: code, subjectName: row.subjectName || code });
            }
        }

        extractedData.forEach(row => {
          if (row.result && row.result.toUpperCase() === 'F') fCount++;
          if (row.result && row.result.toUpperCase() === 'AB') abCount++;
          
          const student = studentMap[row.htno];
          const subject = subjectMap[row.subjectCode];
          
          if (!student) unmatchedHtnos.add(row.htno);
          if (!subject) unmatchedSubjects.add(row.subjectCode);
          
          if (student) {
            const ayId = student.semesterId?.academicYearId?.toString();
            const cohortSpecificSemesterId = ayId && targetSemByAY[ayId] ? targetSemByAY[ayId] : targetSemester._id;

            // Keep rows even if subject is missing, so we can auto-create later
            matched.push({
              studentId: student._id,
              rollNo: student.rollNo,
              branchId: student.branchId, 
              subjectId: subject ? subject._id : null,
              subjectCode: row.subjectCode,
              subjectName: row.subjectName || row.subjectCode,
              academicSemesterId: cohortSpecificSemesterId,
              internalMarks: row.internalMarks,
              result: row.result,
              grade: row.grade,
              credits: row.credits,
              passed: ['P', 'p'].includes(row.result),
            });
          } else {
             const reasons = [];
             if (!student) reasons.push('Student HTNO not found in DB');
             unmatchedRecords.push({
                 ...row,
                 reason: reasons.join(', ')
             });
          }
        });
        
        res.status(200).json({
          status: 'success',
          data: {
            previewData: matched,
            unmatchedRecords,
            unmatchedHtnos: Array.from(unmatchedHtnos),
            missingSubjectsDetails,
            stats: {
              totalExtracted: extractedData.length,
              matchedCount: matched.length,
              unmatchedCount: unmatchedRecords.length,
              unmatchedHtnosCount: unmatchedHtnos.size,
              missingSubjectsCount: missingSubjectsDetails.length,
              fCount,
              abCount,
              detectedSemester
            }
          }
        });
        
      } catch (parseErr) {
        console.error('Error parsing Python output:', parseErr);
        res.status(500).json({ status: 'error', message: 'Failed to read parser output' });
      }
    });
    
  } catch (err) {
    console.error('uploadAndPreview error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.confirmAndImport = async (req, res) => {
  try {
    const { importData, fileName } = req.body;
    
    if (!importData || !Array.isArray(importData)) {
      return res.status(400).json({ status: 'error', message: 'importData array is required' });
    }
    
    let importedCount = 0;
    const dynamicSubjectCache = {};
    
    for (const row of importData) {
      let subjectId = row.subjectId;
      
      // Auto-create genuinely missing subjects here at CONFIRM stage
      if (!subjectId) {
          if (dynamicSubjectCache[row.subjectCode]) {
              subjectId = dynamicSubjectCache[row.subjectCode];
          } else {
              // Double check if it got created by another request concurrently
              let existingSubj = await Subject.findOne({ subjectCode: row.subjectCode });
              if (!existingSubj) {
                  existingSubj = await Subject.create({
                      subjectCode: row.subjectCode,
                      subjectName: row.subjectName,
                      semesterId: row.academicSemesterId
                  });
              }
              subjectId = existingSubj._id;
              dynamicSubjectCache[row.subjectCode] = subjectId;
          }
      }
      
      const query = {
        studentId: row.studentId,
        subjectId: subjectId,
        academicSemesterId: row.academicSemesterId
      };
      
      const updateDoc = {
        $set: {
          internalMarks: row.internalMarks,
          result: row.result,
          grade: row.grade,
          credits: row.credits,
          passed: row.passed,
          importMetadata: {
            importedAt: new Date(),
            fileName: fileName || 'Unknown PDF',
            parserVersion: '1.0'
          }
        }
      };
      
      await SemesterResult.updateOne(query, updateDoc, { upsert: true });
      
      // Phase 16: Backlog Clearance Workflow
      if (row.passed) {
        // Find if this student has an ACTIVE backlog for this subject
        const backlog = await Backlog.findOne({ studentId: row.studentId, subjectId: subjectId, status: 'ACTIVE' });
        if (backlog) {
          backlog.status = 'CLEARED';
          await backlog.save();
          
          // Log audit entry
          await auditService.logAction({
            actor: req.user.id || req.user._id,
            role: req.user.role,
            action: 'BACKLOG_CLEARED',
            entityType: 'Backlog',
            entityId: backlog._id,
            oldValue: 'ACTIVE',
            newValue: 'CLEARED',
            reason: 'Official JNTUK result import (Passed)',
            affectedStudent: row.studentId,
            timestamp: new Date()
          });

          // Recalculate Active Backlog Count and Risk
          const activeBacklogCount = await Backlog.countDocuments({ studentId: row.studentId, status: 'ACTIVE' });
          let riskLevel = 'LOW';
          if (activeBacklogCount >= 5) riskLevel = 'AT-RISK';
          else if (activeBacklogCount >= 3) riskLevel = 'HIGH';
          else if (activeBacklogCount >= 1) riskLevel = 'MEDIUM';
          
          await Student.updateOne(
            { _id: row.studentId }, 
            { $set: { activeBacklogsCount: activeBacklogCount, riskLevel } }
          );
        }
      }
      
      importedCount++;
    }
    
    const notificationService = require('../../notifications/services/notification.service');
    if (req.user) {
      await notificationService.createNotification({
        recipientUserId: req.user.id || req.user._id,
        recipientRole: req.user.role,
        title: 'Result Import Completed',
        message: `Successfully imported ${importedCount} results from ${fileName || 'the uploaded file'}.`,
        notificationType: 'RESULT_IMPORT'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: `Successfully imported ${importedCount} results`,
      importedCount
    });
    
  } catch (err) {
    console.error('confirmAndImport error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error during import' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { branchId, year, sectionId, semesterId } = req.query;
    
    // RBAC check
    let studentQuery = {};
    if (branchId) studentQuery.branchId = branchId;
    if (year) studentQuery.year = year;
    if (sectionId) studentQuery.sectionId = sectionId;
    
    if (req.user.role === 'STUDENT') {
      const studentId = req.user.scopeRef?.refId;
      if (!studentId) {
        return res.status(403).json({ status: 'error', message: 'Student identity missing from token' });
      }
      studentQuery._id = studentId;
    } else if (req.user.role === 'CTPO') {
      const CtpoAssignment = require('../../examination/models/CtpoAssignment');
      const assignment = await CtpoAssignment.findOne({ ctpoUserId: req.user.id || req.user._id, status: 'ACTIVE' });
      if (assignment) {
        studentQuery.sectionId = assignment.sectionId.toString();
        studentQuery.branchId = assignment.branchId.toString();
      } else {
        studentQuery._id = '000000000000000000000000'; // Force 0 results if no active assignment
      }
    } else if (req.user.role === 'HOD') {
      if (req.user.scope && req.user.scope.year) {
        studentQuery.year = Number(req.user.scope.year);
      }
      if (req.user.scopeRef) {
        const scopeType = req.user.scopeRef.type || req.user.scopeRef.refModel;
        if (scopeType === 'Campus') studentQuery.campusId = req.user.scopeRef.refId;
        if (scopeType === 'Branch') studentQuery.branchId = req.user.scopeRef.refId;
      }
    } else if (req.user.scopeRef) {
      const scopeType = req.user.scopeRef.type || req.user.scopeRef.refModel;
      if (scopeType === 'Campus') studentQuery.campusId = req.user.scopeRef.refId;
      if (scopeType === 'Branch') studentQuery.branchId = req.user.scopeRef.refId;
      if (scopeType === 'Student') studentQuery._id = req.user.scopeRef.refId;
    }

    const students = await Student.find(studentQuery).select('_id name rollNo branchId year').lean();
    console.log('Controller studentQuery:', studentQuery);
    console.log('Controller students found:', students.length);
    if (students.length === 0) return res.status(200).json({ status: 'success', data: [] });
    const studentIds = students.map(s => s._id);

    const query = { studentId: { $in: studentIds } };
    if (semesterId) query.academicSemesterId = semesterId;

    const allSemesters = await Semester.find().lean();
    
    // Use the unified academic result service
    const options = { semesterId };
    const finalData = await AcademicResultService.getUnifiedResults(students, options, allSemesters);

    console.log('Final data length after deduplication:', finalData.length);
    res.status(200).json({ status: 'success', data: finalData });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
