const fs = require('fs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/academic_engagement_db').then(async () => {
  const db = mongoose.connection.db;
  
  // Reload the original mappings to reconstruct what was deleted
  const mappingsPath = 'C:/Users/ravit/Desktop/Student Academic Management System/result-processor/diagnostic_mapping.json';
  const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
  
  // Load original raw data to get grades and status
  const rawData = JSON.parse(fs.readFileSync('C:/Users/ravit/Desktop/Student Academic Management System/result-processor/dummy.json', 'utf8'));
  const rawMap = {}; // map by htno -> array of results
  rawData.data.forEach(d => {
    if (!rawMap[d.htno]) rawMap[d.htno] = [];
    rawMap[d.htno].push(d);
  });
  
  const officialSubjs = await db.collection('subjects').find({}).toArray();
  const students = await db.collection('students').find({}).toArray();
  const rollMap = {};
  students.forEach(s => rollMap[s.rollNo] = s);
  
  const semesters = await db.collection('semesters').find({}).toArray();
  const sem32 = semesters.find(s => s.semesterCode === '3-2');
  
  const branches = await db.collection('branches').find({}).toArray();
  const branchMap = {}; // id -> code
  branches.forEach(b => branchMap[b._id.toString()] = b.branchCode);
  
  // Subject branch mappings for 3-2
  const sbm = await db.collection('subjectbranchmappings').find({semesterId: sem32._id}).toArray();
  const validSubjsByBranch = {};
  sbm.forEach(m => {
    const bCode = branchMap[m.branchId.toString()];
    if (!validSubjsByBranch[bCode]) validSubjsByBranch[bCode] = new Set();
    validSubjsByBranch[bCode].add(m.subjectId.toString());
  });
  
  const auditReport = {
    deletedRecords: [],
    unresolvedSoftSkills: [],
    dryRunMappings: []
  };
  
  // Audit the mappings
  for (const m of mappings) {
    const student = rollMap[m.student];
    if (!student) continue;
    const branchCode = branchMap[student.branchId.toString()];
    
    // Fuzzy matching logic that was used in the flawed script
    const cleanSource = m.sourceName.replace(/[^A-Z]/g, '');
    let matchedOfficial = officialSubjs.find(o => o.subjectName === m.sourceName);
    
    if (!matchedOfficial) {
       matchedOfficial = officialSubjs.find(o => {
         const cleanOfficial = o.subjectName.replace(/[^A-Z]/g, '');
         return cleanOfficial === cleanSource || cleanOfficial.includes(cleanSource) || cleanSource.includes(cleanOfficial) || 
           (m.sourceName === 'DISATER MANAGEMENT' && o.subjectName === 'DISASTER MANAGEMENT');
       });
    }
    
    const isSoftSkills = ['R2332426', 'R2332616', 'R2332626', 'R2332128'].includes(m.sourceCode) || m.sourceName.includes('SOFT SKILLS');
    
    // Check if the srId is actually in the DB
    const srExists = await db.collection('semesterresults').findOne({_id: new mongoose.Types.ObjectId(m.srId)});
    
    // Get original raw result
    const rawStudentResults = rawMap[m.student] || [];
    const rawResult = rawStudentResults.find(r => r.subjectCode === m.sourceCode);
    
    if (isSoftSkills) {
      auditReport.unresolvedSoftSkills.push({
        studentId: m.student,
        semester: '3-2',
        sourceName: m.sourceName,
        sourceCode: m.sourceCode
      });
    } else if (matchedOfficial) {
      // It was mapped. Was it deleted?
      if (!srExists) {
        // It was deleted
        const existingDup = await db.collection('semesterresults').findOne({
          studentId: student._id,
          subjectId: matchedOfficial._id,
          academicSemesterId: sem32._id
        });
        
        auditReport.deletedRecords.push({
          studentId: m.student,
          semester: '3-2',
          sourceSubjectName: m.sourceName, // The LAB that got deleted
          mappedSubjectName: matchedOfficial.subjectName, // The THEORY it got mapped to
          originalGrade: rawResult ? rawResult.grade : 'UNKNOWN',
          originalStatus: rawResult ? rawResult.result : 'UNKNOWN',
          duplicateRecordReplacedWith: existingDup ? existingDup._id.toString() : 'NONE',
          duplicateGrade: existingDup ? existingDup.grade : 'NONE',
          isExactDuplicate: existingDup && rawResult && existingDup.grade === rawResult.grade ? 'YES' : 'NO'
        });
      }
      
      // Determine if mapping is correct based on branch Curriculum
      const isValidForBranch = validSubjsByBranch[branchCode] && validSubjsByBranch[branchCode].has(matchedOfficial._id.toString());
      
      // We will only report a sample of dry-run mappings, otherwise it's 3497 rows
      if (auditReport.dryRunMappings.length < 500) {
        auditReport.dryRunMappings.push({
          Branch: branchCode,
          Semester: '3-2',
          SourceName: m.sourceName,
          OfficialSubject: matchedOfficial.subjectName,
          SemesterResultSubjectId: srExists ? srExists.subjectId.toString() : 'DELETED',
          MappingStatus: isValidForBranch ? 'VALID' : 'INVALID',
          Correct: (isValidForBranch && m.sourceName === matchedOfficial.subjectName) ? 'Yes' : 'No'
        });
      }
    }
  }
  
  fs.writeFileSync('./final_audit_report.json', JSON.stringify(auditReport, null, 2));
  console.log('Audit complete');
  process.exit(0);
});
