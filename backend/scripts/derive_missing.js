const fs = require('fs');
const path = require('path');

const inPath = path.resolve(__dirname, '../../complete-curriculum-result-validation.json');
const outPath = path.resolve(__dirname, '../../complete-missing-curriculum.json');

const data = JSON.parse(fs.readFileSync(inPath));

const outData = {};
let verifiedCredits = 0;
let missingCredits = 0;
let ambiguousReview = 0;

const branches = ['CAI', 'CSM', 'CSD', 'AID', 'CSC'];
const semesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];

for (const b of branches) {
  outData[b] = {};
  for (const s of semesters) {
    outData[b][s] = [];
    const records = data[b]?.[s] || [];
    
    for (const r of records) {
      if (r['Missing mapping'] === 'YES' || r['Existing Subject record'] === 'NO') {
        // According to instructions, we cannot guess credits, and we do not have an official reference
        // because montage.png was dummy.
        const cVal = "MISSING"; 
        
        outData[b][s].push({
          branch: b,
          semester: s,
          subjectName: r['Subject Name'],
          type: r['Type'].toUpperCase(),
          existingSubject: r['Existing Subject record'],
          existingMapping: r['Existing SubjectBranchMapping'],
          creditFromReference: cVal,
          referenceSource: "NONE - PENDING ACTUAL IMAGE EXTRACTION",
          recommendedAction: "AWAITING AUTHORITATIVE CREDITS BEFORE CREATION"
        });
        
        if (cVal === "MISSING") missingCredits++;
        else verifiedCredits++;
      }
      
      if (r['Ambiguous normalized names'] === 'YES') {
        ambiguousReview++;
      }
    }
  }
}

const finalOutput = {
  curriculum: outData,
  summary: {
    "Missing subjects with verified credits": verifiedCredits,
    "Missing subjects with missing credits": missingCredits,
    "Ambiguous subjects requiring review": ambiguousReview / 2 // Just rough count, will calculate precisely below
  }
};

// Calculate actual unique ambiguous
const ambiguousSet = new Set();
for (const b of branches) {
  for (const s of semesters) {
    for (const r of data[b]?.[s] || []) {
      if (r['Ambiguous normalized names'] === 'YES') {
        ambiguousSet.add(r['Subject Name']);
      }
    }
  }
}
finalOutput.summary["Ambiguous subjects requiring review"] = ambiguousSet.size;

fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 2));

console.log("Missing subjects with verified credits: " + finalOutput.summary["Missing subjects with verified credits"]);
console.log("Missing subjects with missing credits: " + finalOutput.summary["Missing subjects with missing credits"]);
console.log("Ambiguous subjects requiring review: " + finalOutput.summary["Ambiguous subjects requiring review"]);
