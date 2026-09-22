require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../src/modules/academic-master/models/Student');
const Semester = require('../src/modules/academic-master/models/Semester');
const Subject = require('../src/modules/academic-master/models/Subject');
const SemesterResult = require('../src/modules/results-backlogs/models/SemesterResult');
const AcademicResultService = require('../src/modules/results-backlogs/services/academicResult.service');

async function runGlobalVerification() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const students = await Student.find({}).lean();
  console.log(`Total students to verify: ${students.length}`);
  
  const allSemesters = await Semester.find({}).lean();
  
  let duplicateCountBefore = 0; // Not easily tracked now since we don't fetch naive duplicate counts
  let metrics = {
    totalStudents: students.length,
    year2: 0, year3: 0, year4: 0,
    historicalRows: 0,
    officialRows: 0,
    duplicatesFound: 0,
    invalidHistoricalGrades: 0,
    missingCredits: 0,
    invalidOfficialGrades: 0,
    derivedResultsCount: 0
  };

  const derivedCount = await mongoose.connection.db.collection('derivedsemesterresults').countDocuments().catch(() => 0);
  metrics.derivedResultsCount = derivedCount;

  // Process branch by branch to simulate actual application flow and prevent memory overload
  const branchMap = {};
  students.forEach(s => {
    const bId = s.branchId?.toString();
    if (bId) {
        if (!branchMap[bId]) branchMap[bId] = [];
        branchMap[bId].push(s);
    }
    if (s.year === 2) metrics.year2++;
    if (s.year === 3) metrics.year3++;
    if (s.year === 4) metrics.year4++;
  });

  for (const [branchId, branchStudents] of Object.entries(branchMap)) {
    console.log(`Verifying Branch: ${branchId} (${branchStudents.length} students)`);
    
    // Pass to unified service
    const results = await AcademicResultService.getUnifiedResults(branchStudents, null, allSemesters);
    
    // Perform assertions
    const trackSet = new Set();
    
    for (const r of results) {
        if (r.isHistorical) {
            metrics.historicalRows++;
            if (r.grade !== '-') metrics.invalidHistoricalGrades++;
            if (r.gradePoint !== '-') metrics.invalidHistoricalGrades++;
            if (r.credits === null || r.credits === undefined) metrics.missingCredits++;
        } else {
            metrics.officialRows++;
            // Official grades must have a valid grade point (unless CM/COMPLETED)
            if (r.grade && r.grade !== 'CM' && r.grade !== 'COMPLETED' && r.grade !== 'AB' && r.gradePoint === null) {
                metrics.invalidOfficialGrades++;
            }
        }
        
        const subIdStr = r.subjectId?._id ? r.subjectId._id.toString() : null;
        const subCode = r.subjectId?.subjectCode || r.subjectCode || '';
        const stuIdStr = r.studentId._id ? r.studentId._id.toString() : r.studentId.toString();
        const semIdStr = r.semesterId._id ? r.semesterId._id.toString() : r.semesterId.toString();
        
        const duplicateKeyById = `id_${subIdStr}`;
        const duplicateKeyByCode = `code_${subCode}`;
        
        let dupKey = subIdStr ? duplicateKeyById : duplicateKeyByCode;
        const fullKey = `${stuIdStr}_${semIdStr}_${dupKey}`;
        
        if (trackSet.has(fullKey)) {
            metrics.duplicatesFound++;
        }
        trackSet.add(fullKey);
    }
  }

  console.log('\n--- GLOBAL VERIFICATION METRICS ---');
  console.log(metrics);
  
  if (metrics.duplicatesFound > 0) console.error('FAIL: Duplicates found!');
  if (metrics.invalidHistoricalGrades > 0) console.error('FAIL: Historical grades are not strictly "-"!');
  if (metrics.missingCredits > 0) console.error('FAIL: Missing credits on some subjects!');
  if (metrics.invalidOfficialGrades > 0) console.error('FAIL: Official grade mapped improperly!');
  if (metrics.derivedResultsCount > 0) console.error('FAIL: DerivedSemesterResult records exist!');
  
  const passed = metrics.duplicatesFound === 0 && 
                 metrics.invalidHistoricalGrades === 0 && 
                 metrics.missingCredits === 0 && 
                 metrics.invalidOfficialGrades === 0 &&
                 metrics.derivedResultsCount === 0;
                 
  if (passed) {
      console.log('\nALL GLOBAL DATA VALIDATIONS PASSED.');
  }

  await mongoose.disconnect();
}

runGlobalVerification().catch(console.error);
