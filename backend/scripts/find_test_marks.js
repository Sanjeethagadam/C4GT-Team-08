require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Marks = require('../src/modules/examination/models/Marks');
  const Examination = require('../src/modules/examination/models/Examination');
  const Student = require('../src/modules/academic-master/models/Student');
  const Subject = require('../src/modules/academic-master/models/Subject');

  const usernames = ['25KTCAI', '24KTCAI', '23KTCAI'];
  const testUsers = await User.find({ username: { $in: usernames } }).lean();
  const testUserIds = testUsers.map(u => u._id);

  // We find marks where lastModifiedBy is one of the test CTPOs.
  // We can also check the marks submitted in the last hour to be safe.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const allMarks = await Marks.find({}).lean();
  
  let testMarksInserted = 0;
  let existingLegitimateMarks = 0;
  const testRecords = [];

  for (const mark of allMarks) {
    // Determine if it's a test mark.
    // The test script ran recently, so we check if lastModifiedBy is one of our test users
    // AND if it was modified recently.
    const isTestUser = testUserIds.some(id => id.toString() === mark.lastModifiedBy?.toString());
    const isRecent = mark.updatedAt && mark.updatedAt >= oneHourAgo;
    
    if (isTestUser && isRecent) {
      testMarksInserted++;
      
      const exam = await Examination.findById(mark.examinationId).lean();
      const student = await Student.findById(mark.studentId).lean();
      const subject = await Subject.findById(mark.subjectId).lean();
      
      testRecords.push({
        _id: mark._id,
        examination: exam ? `${exam.examType} (Sem: ${exam.semesterId})` : mark.examinationId,
        student: student ? student.rollNo : mark.studentId,
        subject: subject ? subject.subjectName : mark.subjectId,
        marksObtained: mark.marksObtained,
        maxMarks: mark.maxMarks,
        status: mark.status,
        lastModifiedBy: testUsers.find(u => u._id.toString() === mark.lastModifiedBy.toString()).username,
        updatedAt: mark.updatedAt
      });
    } else {
      existingLegitimateMarks++;
    }
  }

  console.log(`test marks inserted = ${testMarksInserted}`);
  console.log(`existing legitimate marks preserved = ${existingLegitimateMarks}`);
  console.log(`exact test records identified = ${testMarksInserted}`);
  console.log('--- TEST RECORDS ---');
  console.log(JSON.stringify(testRecords, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
