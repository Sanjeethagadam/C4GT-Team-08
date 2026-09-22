const fs = require('fs');
const path = require('path');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');

const DIRECT_REFERENCE_COMBS = [
    "CAI -> 1-2",
    "CSM -> 1-1",
    "CSD -> 1-2",
    "AID -> 1-1",
    "CSC -> 1-2"
];

let creditsData = JSON.parse(fs.readFileSync(CREDITS_FILE));
const newCreditsData = {};

for (const bCode of Object.keys(creditsData)) {
    newCreditsData[bCode] = {};
    for (const semCode of Object.keys(creditsData[bCode])) {
        const comb = `${bCode} -> ${semCode}`;
        const isDirect = DIRECT_REFERENCE_COMBS.includes(comb);
        
        newCreditsData[bCode][semCode] = creditsData[bCode][semCode].map(subj => {
            return {
                subjectName: subj.subjectName,
                credits: subj.credits,
                type: subj.type,
                sourceType: isDirect ? "DIRECT_REFERENCE" : "INFERRED",
                sourceReference: isDirect ? "Original 5 Screenshot Datasets" : "Standard JNTUK R23 Patterns (Pending Verification)"
            };
        });
    }
}

fs.writeFileSync(CREDITS_FILE, JSON.stringify(newCreditsData, null, 2));
console.log("Updated branch-semester-credits.json with inline provenance data.");
