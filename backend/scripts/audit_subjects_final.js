
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  require('../src/modules/academic-master/models/Subject');
  require('../src/modules/academic-master/models/Branch');
  require('../src/modules/academic-master/models/Semester');
  const SBM = require('../src/modules/academic-master/models/SubjectBranchMapping');
  
  const mappings = await SBM.find({ status: 'ACTIVE' }).populate('subjectId branchId semesterId').lean();
  const allSubjects = await mongoose.model('Subject').find().lean();
  
  const groups = {};
  
  // To track 'AVG' or weird things
  const suspiciousNames = [];
  
  mappings.forEach(m => {
    if (!m.subjectId || !m.branchId || !m.semesterId) return;
    
    const branchName = m.branchId.name || m.branchId.code;
    const year = m.semesterId.year;
    const semesterCode = m.semesterId.semesterCode;
    const rawName = m.subjectId.subjectName;
    const normalizedName = rawName.trim().replace(/\s+/g, ' ').toLowerCase();
    
    if (rawName.includes('AVG') || rawName.includes('avg') || rawName.match(/[^a-zA-Z0-9 &\/.\-()]/)) {
        if (!suspiciousNames.some(s => s.id === m.subjectId._id.toString())) {
            suspiciousNames.push({
                id: m.subjectId._id.toString(),
                code: m.subjectId.subjectCode,
                name: rawName,
                branch: branchName,
                sem: semesterCode
            });
        }
    }
    
    const key = branchName + '|' + year + '|' + semesterCode;
    if (!groups[key]) {
      groups[key] = {
        branch: branchName,
        year: year,
        semester: semesterCode,
        rawSubjects: [],
        uniqueDisplay: new Set(),
        duplicates: [],
        reviewRequired: []
      };
    }
    
    groups[key].rawSubjects.push({
        id: m.subjectId._id.toString(),
        name: rawName,
        code: m.subjectId.subjectCode
    });
    
    if (groups[key].uniqueDisplay.has(normalizedName)) {
        groups[key].duplicates.push(rawName);
    } else {
        groups[key].uniqueDisplay.add(normalizedName);
    }
  });

  console.log('--- AUDIT REPORT ---');
  console.log('Branch | Year | Semester | Raw Subjects | Unique Display Subjects | Duplicate Names');
  for (const key of Object.keys(groups).sort()) {
      const g = groups[key];
      console.log(
        g.branch.padEnd(45) + ' | ' + 
        String(g.year).padEnd(4) + ' | ' + 
        g.semester.padEnd(8) + ' | ' + 
        String(g.rawSubjects.length).padEnd(12) + ' | ' + 
        String(g.uniqueDisplay.size).padEnd(23) + ' | ' + 
        g.duplicates.length
      );
  }
  
  console.log('\n--- SUSPICIOUS NAMES (AVG or symbols) ---');
  if (suspiciousNames.length === 0) console.log('None found.');
  suspiciousNames.forEach(s => {
      console.log('ID:', s.id, '| Code:', s.code, '| Name:', s.name, '| Branch:', s.branch, '| Sem:', s.sem);
  });
  
  console.log('\n--- DASHBOARD METRICS ---');
  console.log('Raw Subject documents:', allSubjects.length);
  console.log('Mapped Subject records (mappings):', mappings.length);
  
  const mappedSubjectIds = new Set(mappings.map(m => m.subjectId._id.toString()));
  console.log('Mapped Subject IDs (unique subject docs used):', mappedSubjectIds.size);
  
  const mappedSubjectCodes = new Set(mappings.map(m => m.subjectId.subjectCode));
  console.log('Unique mapped Subject Codes:', mappedSubjectCodes.size);
  
  let totalUniqueLogicalDisplayed = 0;
  for (const g of Object.values(groups)) {
      totalUniqueLogicalDisplayed += g.uniqueDisplay.size;
  }
  console.log('Unique logical displayed subjects (sum of unique per branch/sem):', totalUniqueLogicalDisplayed);
  
  process.exit(0);
}
run().catch(console.error);

