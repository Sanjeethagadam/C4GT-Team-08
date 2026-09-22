const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const StagingBacklog = require('../models/StagingBacklog');
const Student = require('../../academic-master/models/Student');
const Campus = require('../../academic-master/models/Campus');
const Branch = require('../../academic-master/models/Branch');
const Semester = require('../../academic-master/models/Semester');
const AcademicYear = require('../../academic-master/models/AcademicYear');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const runImport = async (filePath, mode) => {
  await connectDB();

  let rowsProcessedBySheet = { '2': 0, '3': 0, '4': 0 };
  let studentsInserted = 0;
  let studentsUpdated = 0;
  let studentsSkipped = 0;
  let stagingRecordsCreated = 0;
  let pendingSubjectMasterRecords = 0; 
  let countMismatches = 0;
  let invalidHtno = 0;
  let invalidCampus = 0;
  let invalidBranch = 0;
  let subjectRecordsCreated = 0;
  let actualBacklogRecordsCreated = 0;

  try {
    const activeAcademicYear = await AcademicYear.findOne({ status: 'ACTIVE' });
    if (!activeAcademicYear) {
      throw new Error("No active Academic Year found. Import failed.");
    }
    
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    // Map sheet names to semester names for 2-1, 3-1, 4-1
    const sheetToSemesterName = {
        '2': '2-1',
        '3': '3-1',
        '4': '4-1'
    };

    const campuses = await Campus.find();
    const campusMap = {
        'K1': campuses.find(c => c.code === 'K1'),
        'KK': campuses.find(c => c.code === 'KK')
    };

    const semesters = await Semester.find({ academicYearId: activeAcademicYear._id });
    const semesterMap = semesters.reduce((acc, sem) => {
        acc[sem.semesterCode] = sem;
        return acc;
    }, {});
    
    const branches = await Branch.find();
    const branchCodeMap = branches.reduce((acc, br) => {
        acc[br.code.toUpperCase()] = br;
        return acc;
    }, {});

    const branchPatternMap = {
        'A42': 'CSM',
        'A43': 'CAI',
        'A44': 'CSD',
        'A45': 'AI&DS',
        'A46': 'CSC'
    };

    const backlogColumns = ['11', '12', '21', '22', '31', '32', '41', '42'];
    
    const columnToSemesterCode = {
        '11': '1-1', '12': '1-2', '21': '2-1', '22': '2-2',
        '31': '3-1', '32': '3-2', '41': '4-1', '42': '4-2'
    };

    let existingStagingDeleted = 0;
    if (mode === 'staging') {
        const deleteResult = await StagingBacklog.deleteMany({ sourceWorkbook: path.basename(filePath) });
        existingStagingDeleted = deleteResult.deletedCount;
        console.log(`Deleted ${existingStagingDeleted} existing staging records for workbook ${path.basename(filePath)}.`);
    }

    for (const sheetName of sheetNames) {
        if (!['2', '3', '4'].includes(sheetName)) {
            continue;
        }

        const semesterName = sheetToSemesterName[sheetName];
        const semesterObj = semesterMap[semesterName];
        if (!semesterObj) {
            console.log(`Semester ${semesterName} not found in DB. Skipping sheet ${sheetName}.`);
            continue;
        }

        let year = parseInt(sheetName, 10);

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });
        
        for (let rowIdx = 0; rowIdx < jsonData.length; rowIdx++) {
            const row = jsonData[rowIdx];
            const sourceRowNumber = rowIdx + 2; 

            rowsProcessedBySheet[sheetName]++;

            const rollNo = row['HTNO'] ? String(row['HTNO']).trim() : null;
            if (!rollNo) {
                invalidHtno++;
                studentsSkipped++;
                continue; 
            }
            
            const name = row['NAME'] ? String(row['NAME']).trim() : 'Unknown';
            const col = row['COL'] ? String(row['COL']).trim().toUpperCase() : null;
            
            const campusObj = campusMap[col];
            if (!campusObj) {
                invalidCampus++;
                studentsSkipped++;
                continue;
            }
            
            // Extract branch
            const branchMatch = rollNo.match(/A4[2-6]/);
            if (!branchMatch) {
                invalidBranch++;
                studentsSkipped++;
                continue;
            }
            const branchPattern = branchMatch[0];
            const branchCode = branchPatternMap[branchPattern];
            const branchObj = branchCodeMap[branchCode];
            
            if (!branchObj) {
                invalidBranch++;
                studentsSkipped++;
                continue;
            }
            
            if (mode === 'students') {
                const existingStudent = await Student.findOne({ rollNo });
                if (!existingStudent) {
                    const student = new Student({
                        rollNo,
                        name,
                        campusId: campusObj._id,
                        branchId: branchObj._id,
                        year,
                        semesterId: semesterObj._id,
                        sectionId: null, 
                        isImportDerivedSemester: true
                    });
                    await student.save();
                    studentsInserted++;
                } else {
                    existingStudent.name = name;
                    existingStudent.campusId = campusObj._id;
                    existingStudent.branchId = branchObj._id;
                    existingStudent.year = year;
                    existingStudent.semesterId = semesterObj._id;
                    existingStudent.sectionId = null;
                    existingStudent.isImportDerivedSemester = true;
                    await existingStudent.save();
                    studentsUpdated++;
                }
            } else if (mode === 'staging') {
                const existingStudent = await Student.findOne({ rollNo });
                if (!existingStudent) {
                    studentsSkipped++;
                    continue; 
                }

                const reportedBacklogCount = row['No of BACKLOGS'] !== null && row['No of BACKLOGS'] !== undefined 
                    ? parseInt(row['No of BACKLOGS'], 10) || 0 
                    : 0;
                
                let columnParsedData = [];
                let totalParsedSubjectCount = 0;
                
                for (const colName of backlogColumns) {
                    if (row[colName]) {
                        const cellVal = String(row[colName]).trim();
                        if (cellVal) {
                            const splitValues = cellVal.split(',').map(s => s.trim()).filter(s => s !== '');
                            if (splitValues.length > 0) {
                                columnParsedData.push({
                                    colName,
                                    rawSubjectValue: cellVal,
                                    parsedSubjectCodes: splitValues,
                                    semesterParsedSubjectCount: splitValues.length
                                });
                                totalParsedSubjectCount += splitValues.length;
                            }
                        }
                    }
                }
                
                let studentCountMismatch = 0;
                if (reportedBacklogCount !== totalParsedSubjectCount) {
                    countMismatches++;
                    studentCountMismatch = reportedBacklogCount - totalParsedSubjectCount;
                }
                
                for (const colData of columnParsedData) {
                    const academicSemesterCode = columnToSemesterCode[colData.colName];
                    const semesterObj = semesterMap[academicSemesterCode];
                    
                    if (!semesterObj) {
                        continue; 
                    }
                    
                    const existingStaging = await StagingBacklog.findOne({
                        studentId: existingStudent._id,
                        academicSemesterCode,
                        sourceWorkbook: path.basename(filePath),
                        sourceSheet: sheetName
                    });

                    if (!existingStaging) {
                        const stagingRecord = new StagingBacklog({
                            studentId: existingStudent._id,
                            htno: rollNo,
                            studentName: name,
                            campusCode: col,
                            branchCode: branchCode,
                            sourceWorkbook: path.basename(filePath),
                            sourceSheet: sheetName,
                            sourceRowNumber,
                            academicSemesterCode,
                            academicSemesterId: semesterObj._id,
                            rawSubjectValue: colData.rawSubjectValue,
                            parsedSubjectCodes: colData.parsedSubjectCodes,
                            semesterParsedSubjectCount: colData.semesterParsedSubjectCount,
                            reportedBacklogCount,
                            totalParsedSubjectCount,
                            countMismatch: studentCountMismatch,
                            status: 'PENDING_SUBJECT_MASTER'
                        });
                        await stagingRecord.save();
                        stagingRecordsCreated++;
                    } else {
                        existingStaging.rawSubjectValue = colData.rawSubjectValue;
                        existingStaging.parsedSubjectCodes = colData.parsedSubjectCodes;
                        existingStaging.semesterParsedSubjectCount = colData.semesterParsedSubjectCount;
                        existingStaging.reportedBacklogCount = reportedBacklogCount;
                        existingStaging.totalParsedSubjectCount = totalParsedSubjectCount;
                        existingStaging.countMismatch = studentCountMismatch;
                        existingStaging.studentName = name;
                        await existingStaging.save();
                    }
                }
            }
        }
    }

    const totalRowsProcessed = rowsProcessedBySheet['2'] + rowsProcessedBySheet['3'] + rowsProcessedBySheet['4'];

    console.log("---- Import Results ----");
    console.log(`Sheet 2 rows processed = ${rowsProcessedBySheet['2']}`);
    console.log(`Sheet 3 rows processed = ${rowsProcessedBySheet['3']}`);
    console.log(`Sheet 4 rows processed = ${rowsProcessedBySheet['4']}`);
    console.log(`Total rows processed = ${totalRowsProcessed}`);
    console.log(`Students inserted = ${studentsInserted}`);
    console.log(`Students updated = ${studentsUpdated}`);
    console.log(`Student errors = ${studentsSkipped}`);
    console.log(`Existing staging records deleted = ${existingStagingDeleted}`);
    console.log(`Staging records = ${stagingRecordsCreated}`);
    console.log(`Pending Subject Master = ${pendingSubjectMasterRecords}`);
    console.log(`Count mismatches = ${countMismatches}`);
    console.log(`Invalid HTNO = ${invalidHtno}`);
    console.log(`Invalid campus = ${invalidCampus}`);
    console.log(`Invalid branch = ${invalidBranch}`);
    console.log(`Subject records created by import = ${subjectRecordsCreated}`);
    console.log(`Actual Backlog records created by import = ${actualBacklogRecordsCreated}`);
    
  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    mongoose.disconnect();
  }
};

const filePath = process.argv[2];
const mode = process.argv[3]; // 'students' or 'staging'

if (!filePath) {
    console.error("Please provide a file path to the excel file.");
    process.exit(1);
}

if (!['students', 'staging'].includes(mode)) {
    console.error("Please provide a valid mode: 'students' or 'staging'");
    process.exit(1);
}

runImport(filePath, mode);
