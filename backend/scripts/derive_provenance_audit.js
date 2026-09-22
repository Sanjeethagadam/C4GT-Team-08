const fs = require('fs');
const path = require('path');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const OUT_FILE = path.resolve(__dirname, '../../credit-provenance-audit.json');

const creditsData = JSON.parse(fs.readFileSync(CREDITS_FILE));

const auditReport = {
    audit: [],
    inferred_list: [],
    missing_list: [],
    summary: {
        total_expected: 0,
        direct_reference: 0,
        subject_pdf: 0,
        database: 0,
        inferred: 0,
        missing: 0,
        status: "READY"
    }
};

for (const bCode of Object.keys(creditsData)) {
    for (const semCode of Object.keys(creditsData[bCode])) {
        for (const subj of creditsData[bCode][semCode]) {
            auditReport.summary.total_expected++;
            
            const sourceType = subj.sourceType || "INFERRED";
            
            const entry = {
                branch: bCode,
                semester: semCode,
                subjectName: subj.subjectName || subj.name,
                credits: subj.credits,
                type: subj.type,
                sourceType: sourceType,
                sourceReference: subj.sourceReference || "No reference provided",
                verificationStatus: sourceType === "DIRECT_REFERENCE" ? "VERIFIED" : "UNVERIFIED"
            };
            
            auditReport.audit.push(entry);
            
            if (sourceType === "DIRECT_REFERENCE") auditReport.summary.direct_reference++;
            else if (sourceType === "INFERRED") {
                auditReport.summary.inferred++;
                auditReport.inferred_list.push(entry);
                auditReport.summary.status = "NOT READY (INFERRED CREDITS DETECTED)";
            }
        }
    }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(auditReport, null, 2));

console.log(`${auditReport.summary.total_expected} total expected`);
console.log(`${auditReport.summary.direct_reference} directly verified`);
console.log(`${auditReport.summary.subject_pdf + auditReport.summary.database} from PDF/database`);
console.log(`${auditReport.summary.inferred} inferred`);
console.log(`${auditReport.summary.missing} missing`);
console.log(`Status: ${auditReport.summary.status}`);
