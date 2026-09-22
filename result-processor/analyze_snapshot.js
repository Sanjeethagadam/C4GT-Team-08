const fs = require('fs');

const auditDeleted = JSON.parse(fs.readFileSync('audit_deleted.json', 'utf8'));
const diagnosticMapping = JSON.parse(fs.readFileSync('diagnostic_mapping.json', 'utf8'));
const finalAudit = JSON.parse(fs.readFileSync('final_audit_report.json', 'utf8'));

console.log("auditDeleted keys:", Object.keys(auditDeleted[0]));
console.log("diagnosticMapping keys:", Object.keys(diagnosticMapping[0]));
console.log("finalAudit keys:", Object.keys(finalAudit));
console.log("finalAudit deletedRecords keys:", finalAudit.deletedRecords.length > 0 ? Object.keys(finalAudit.deletedRecords[0]) : "none");
