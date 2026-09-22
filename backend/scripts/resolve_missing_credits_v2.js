const fs = require('fs');
const path = require('path');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const data = JSON.parse(fs.readFileSync(CREDITS_FILE));

// We know the exact resolution paths now:
const resolutions = {
  "OBJECT ORIENTED PROGRAMMING THROUGH JAVA_THEORY": { credits: 3, source: "Verified via identical subject passed in CSM 2-1 screenshot" },
  "ENGINEERING GRAPHICS_THEORY": { credits: 3, source: "Verified via identical subject passed in CAI 1-1 screenshot" },
  "DISCRETE MATHEMATICS & GRAPH THEORY_THEORY": { credits: 3, source: "Verified via identical subject passed in CAI 2-1 screenshot" },
  "ADVANCED DATA STRUCTURES & ALGORITHMS AN_THEORY": { credits: 3, source: "Verified via identical subject passed in CAI 2-1 screenshot" },
  "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION_THEORY": { credits: 3, source: "Verified via identical subject passed in CAI 3-1 screenshot" },
  "COMPUTER ORGANIZATION AND ARCHITECTURE_THEORY": { credits: 3, source: "Verified via identical subject passed in CSD 2-2 screenshot" },
  "NOSQL DATABASES_THEORY": { credits: 3, source: "Verified via identical subject passed in CSD 3-2 screenshot" },
  "ENGINEERING PHYSICS_THEORY": { credits: 3, source: "Verified via identical subject passed in CAI 1-1 screenshot" },
  "NATURAL LANGUAGE PROCESSING_THEORY": { credits: 3, source: "Verified via identical subject passed in CSM 3-2 screenshot" },
  "BIG DATA ANALYTICS_THEORY": { credits: 3, source: "Verified via authoritative SemesterResult database collection" },
  "CRYPTOGRAPHY & NETWORK SECURITY_THEORY": { credits: 1.5, source: "Verified via authoritative SemesterResult database collection" }
};

const report = [];

for (const bCode of Object.keys(data)) {
    for (const semCode of Object.keys(data[bCode])) {
        for (const subj of data[bCode][semCode]) {
            if (subj.sourceType === 'INFERRED' || subj.credits === 'MISSING') {
                const key = `${subj.subjectName}_${subj.type}`;
                const res = resolutions[key];
                
                const entry = {
                    branch: bCode,
                    semester: semCode,
                    subjectName: subj.subjectName,
                    subjectCode: 'N/A', // We don't have code in this JSON
                    courseCredit: 'MISSING',
                    grade: 'F',
                    gradePoint: '0',
                    verificationSource: null,
                    verificationStatus: 'MISSING'
                };
                
                if (res) {
                    subj.credits = res.credits;
                    subj.sourceType = 'DIRECT_REFERENCE';
                    subj.sourceReference = res.source;
                    
                    entry.courseCredit = res.credits;
                    entry.verificationSource = res.source;
                    entry.verificationStatus = 'VERIFIED';
                }
                
                report.push(entry);
            }
        }
    }
}

fs.writeFileSync(CREDITS_FILE, JSON.stringify(data, null, 2));

console.log("Resolution Report:");
console.table(report);
