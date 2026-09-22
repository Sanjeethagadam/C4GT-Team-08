const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const OUT_FILE = path.resolve(__dirname, '../../missing-credit-review.json');

async function runReview() {
  const report = {};
  let verifiedCredits = 0;
  let missingCredits = 0;

  try {
    if (!fs.existsSync(CREDITS_FILE)) {
      throw new Error(`CRITICAL: The credit mapping file ${CREDITS_FILE} is missing.`);
    }

    const creditsData = JSON.parse(fs.readFileSync(CREDITS_FILE));

    console.log("Connecting to Database to validate mappings...");
    await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');

    const Branch = mongoose.model('Branch', new mongoose.Schema({}, {strict: false}), 'branches');
    const Semester = mongoose.model('Semester', new mongoose.Schema({}, {strict: false}), 'semesters');
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, {strict: false}), 'subjects');
    const SBM = mongoose.model('SubjectBranchMapping', new mongoose.Schema({}, {strict: false}), 'subjectbranchmappings');

    const branches = await Branch.find();
    const semesters = await Semester.find();
    const subjects = await Subject.find();
    const sbms = await SBM.find({ status: 'ACTIVE' });

    const branchMap = {};
    branches.forEach(b => branchMap[b.code] = b._id.toString());
    
    const semesterMap = {};
    semesters.forEach(s => semesterMap[s.semesterCode] = s._id.toString());
    
    const normalize = str => str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

    const getBranchId = (code) => {
        if (branchMap[code]) return branchMap[code];
        if (code === 'AID' && branchMap['AI&DS']) return branchMap['AI&DS'];
        return null;
    };

    const branchesToCheck = ['CAI', 'CSM', 'CSD', 'AID', 'CSC'];
    const semsToCheck = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];

    for (const bCode of branchesToCheck) {
      report[bCode] = {};
      const branchId = getBranchId(bCode);
      if (!branchId) continue;

      for (const semCode of semsToCheck) {
        report[bCode][semCode] = [];
        const semesterId = semesterMap[semCode];
        
        const referenceSubjects = creditsData[bCode]?.[semCode] || [];

        for (const refSubj of referenceSubjects) {
          const officialName = refSubj.subjectName;
          const officialCredit = refSubj.credits;
          const officialType = refSubj.type;
          
          let creditStatus = "VERIFIED";
          if (officialCredit === undefined || officialCredit === null) {
            creditStatus = "MISSING";
            missingCredits++;
          } else {
            verifiedCredits++;
          }

          const normOfficial = normalize(officialName);
          let foundSubjects = subjects.filter(s => normalize(s.subjectName) === normOfficial);
          
          let existingSubject = "NO";
          let existingMapping = "NO";
          let ambiguous = "NO";
          
          if (foundSubjects.length > 0) {
            existingSubject = "YES";
            if (foundSubjects.length > 1) ambiguous = "YES";

            const mappingsForThisBranchSem = sbms.filter(m => 
                m.branchId.toString() === branchId &&
                m.semesterId.toString() === semesterId &&
                foundSubjects.some(s => s._id.toString() === m.subjectId.toString())
            );

            if (mappingsForThisBranchSem.length > 0) {
              existingMapping = "YES";
            }
          }

          report[bCode][semCode].push({
            Branch: bCode,
            Semester: semCode,
            "Subject Name": officialName,
            Type: officialType,
            Credit: officialCredit !== undefined ? officialCredit : "MISSING",
            "Credit Status": creditStatus,
            "Existing Subject": existingSubject,
            "Existing Mapping": existingMapping,
            "Ambiguous Name": ambiguous
          });
        }
      }
    }

    const finalOutput = {
      review: report,
      summary: {
        "Verified credits": verifiedCredits,
        "Missing credits": missingCredits
      }
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(finalOutput, null, 2));
    
    console.log("Validation completed.");
    console.log("Verified credits: " + verifiedCredits);
    console.log("Missing credits: " + missingCredits);
    console.log(`Report written to ${OUT_FILE}`);
    process.exit(0);

  } catch (err) {
    console.error("Error during execution:", err);
    process.exit(1);
  }
}

runReview();
