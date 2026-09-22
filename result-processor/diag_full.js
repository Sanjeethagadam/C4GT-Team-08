const fs = require('fs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/academic_engagement_db').then(async () => {
  const db = mongoose.connection.db;
  const srs = await db.collection('semesterresults').find({subjectId: {$exists: true}}).sort({_id: 1}).toArray();
  const data = JSON.parse(fs.readFileSync('./dummy.json', 'utf8'));
  
  const studentMap = {};
  data.data.forEach(d => {
    if (!studentMap[d.htno]) studentMap[d.htno] = [];
    studentMap[d.htno].push(d);
  });
  
  const students = await db.collection('students').find({}).toArray();
  const rollMap = {};
  students.forEach(s => rollMap[s._id.toString()] = s.rollNo);
  
  const missingSubjectIds = new Set();
  const mappingsToRepair = [];
  
  for (const sr of srs) {
    const htno = rollMap[sr.studentId.toString()];
    if (!htno || !studentMap[htno]) continue;
    
    const subjStr = sr.subjectId.toString();
    const realSubj = await db.collection('subjects').findOne({_id: sr.subjectId});
    
    if (!realSubj) {
      missingSubjectIds.add(subjStr);
      // find all possible matches for this row
      const possibleRows = studentMap[htno].filter(d => 
        d.grade === sr.grade && 
        d.credits == sr.credits && 
        d.internalMarks == sr.internalMarks
      );
      
      if (possibleRows.length > 0) {
        // we take the first match and remove it so we don't double map identical rows (like the 2 identical C grades)
        const match = possibleRows.shift();
        studentMap[htno] = studentMap[htno].filter(d => d !== match);
        
        mappingsToRepair.push({
          srId: sr._id,
          missingSubjectId: subjStr,
          sourceName: match.subjectName,
          sourceCode: match.subjectCode,
          student: htno
        });
      }
    }
  }
  
  console.log(`Unique Missing Subject Ids: ${missingSubjectIds.size}`);
  console.log('Sample mappings:');
  console.log(mappingsToRepair.slice(0, 10));
  
  // Write full diagnostic mapping out to a file so we can read it easily
  fs.writeFileSync('./diagnostic_mapping.json', JSON.stringify(mappingsToRepair, null, 2));
  
  process.exit(0);
});
