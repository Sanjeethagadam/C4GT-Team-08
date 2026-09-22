const fs = require('fs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/academic_engagement_db').then(async () => {
  const db = mongoose.connection.db;
  const mappings = JSON.parse(fs.readFileSync('./diagnostic_mapping.json', 'utf8'));
  
  const officialSubjs = await db.collection('subjects').find({}).toArray();
  
  const uniqueMissing = {};
  
  for (const m of mappings) {
    if (!uniqueMissing[m.missingSubjectId]) {
      uniqueMissing[m.missingSubjectId] = {
        missingSubjectId: m.missingSubjectId,
        sourceName: m.sourceName,
        sourceCode: m.sourceCode,
        count: 0
      };
    }
    uniqueMissing[m.missingSubjectId].count++;
  }
  
  const report = [];
  
  Object.values(uniqueMissing).forEach(missing => {
    // try to match with official
    // we match by a fuzzy string comparison or simple include
    const cleanSource = missing.sourceName.replace(/[^A-Z]/g, '');
    let matchedOfficial = null;
    
    // Exact match first
    matchedOfficial = officialSubjs.find(o => o.subjectName === missing.sourceName);
    
    if (!matchedOfficial) {
       // Fuzzy match
       matchedOfficial = officialSubjs.find(o => {
         const cleanOfficial = o.subjectName.replace(/[^A-Z]/g, '');
         return cleanOfficial === cleanSource || cleanOfficial.includes(cleanSource) || cleanSource.includes(cleanOfficial) || 
           (missing.sourceName === 'DISATER MANAGEMENT' && o.subjectName === 'DISASTER MANAGEMENT');
       });
    }
    
    report.push({
      missingSubjectId: missing.missingSubjectId,
      sourceCode: missing.sourceCode,
      sourceName: missing.sourceName,
      officialId: matchedOfficial ? matchedOfficial._id.toString() : 'GENUINELY MISSING',
      officialCode: matchedOfficial ? matchedOfficial.subjectCode : null,
      officialName: matchedOfficial ? matchedOfficial.subjectName : null,
      affectedRecords: missing.count
    });
  });
  
  fs.writeFileSync('./diagnostic_report.json', JSON.stringify(report, null, 2));
  console.log('Generated diagnostic_report.json with', report.length, 'unique missing subjects');
  
  process.exit(0);
});
