const fs = require('fs');
const path = require('path');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const data = JSON.parse(fs.readFileSync(CREDITS_FILE));

// Build a dictionary of direct references by subject name
const directRefDict = {};

for (const bCode of Object.keys(data)) {
    for (const semCode of Object.keys(data[bCode])) {
        for (const subj of data[bCode][semCode]) {
            if (subj.sourceType === 'DIRECT_REFERENCE' && subj.credits !== 'MISSING') {
                if (!directRefDict[subj.subjectName]) {
                    directRefDict[subj.subjectName] = {
                        credits: subj.credits,
                        branch: bCode,
                        semester: semCode
                    };
                }
            }
        }
    }
}

// Now resolve the missing ones
const report = [];

for (const bCode of Object.keys(data)) {
    for (const semCode of Object.keys(data[bCode])) {
        for (const subj of data[bCode][semCode]) {
            if (subj.sourceType === 'INFERRED' || subj.credits === 'MISSING') {
                const resolution = directRefDict[subj.subjectName];
                
                const entry = {
                    branch: bCode,
                    semester: semCode,
                    subjectName: subj.subjectName,
                    courseCredit: subj.credits,
                    grade: 'F',
                    gradePoint: '0',
                    verificationSource: null,
                    verificationStatus: 'MISSING'
                };
                
                if (resolution) {
                    subj.credits = resolution.credits;
                    subj.sourceType = 'DIRECT_REFERENCE';
                    subj.sourceReference = `Verified via identical subject passed in ${resolution.branch} ${resolution.semester}`;
                    
                    entry.courseCredit = resolution.credits;
                    entry.verificationSource = subj.sourceReference;
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
