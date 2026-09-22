const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupAccounts() {
  await mongoose.connect('mongodb://localhost:27017/academic_engagement_db');
  console.log('Connected to DB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
  
  // Clean up old demo accounts (except CTPOs) to make sure we don't have dangling accounts
  await User.collection.deleteMany({ username: { $in: ['hod_demo', 'coordinator_demo', 'principal_demo', 'student_demo', '23KTCAID'] } });
  
  const student = await Student.findOne();
  if (!student) throw new Error('No students found in DB');
  
  const studentRoll = student.rollNo;
  const studentPasswordHash = await bcrypt.hash(studentRoll, 10);
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  
  const accountsToCreate = [
    {
      username: 'hod_year2',
      role: 'HOD',
      scopeRef: null,
      scope: { year: 2 } // Legacy scope for frontend support if it ever reads it
    },
    {
      username: 'hod_year3',
      role: 'HOD',
      scopeRef: null,
      scope: { year: 3 }
    },
    {
      username: 'hod_year4',
      role: 'HOD',
      scopeRef: null,
      scope: { year: 4 }
    },
    {
      username: 'principal',
      role: 'PRINCIPAL',
      scopeRef: null
    },
    {
      username: 'coordinator',
      role: 'COORDINATOR',
      scopeRef: null // null scopeRef means all branches
    },
    {
      username: studentRoll,
      role: 'STUDENT',
      scopeRef: { type: 'Student', refId: student._id },
      passwordHash: studentPasswordHash // Custom password for student
    }
  ];

  const results = [];

  for (const account of accountsToCreate) {
    const existing = await User.findOne({ username: account.username });
    if (existing) {
      results.push({
        username: account.username,
        role: account.role,
        scope: account.scopeRef ? account.scopeRef.type : (account.role === 'HOD' ? `Year ${account.scope.year} (All Branches)` : 'Institution-wide (All Branches)'),
        linkedId: account.scopeRef ? account.scopeRef.refId.toString() : 'N/A',
        status: 'Already Existed'
      });
    } else {
      const pass = account.passwordHash || defaultPasswordHash;
      const { passwordHash, ...accData } = account;
      
      await User.collection.insertOne({
        ...accData,
        passwordHash: pass,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      results.push({
        username: account.username,
        role: account.role,
        scope: account.scopeRef ? account.scopeRef.type : (account.role === 'HOD' ? `Year ${account.scope.year} (All Branches)` : 'Institution-wide (All Branches)'),
        linkedId: account.scopeRef ? account.scopeRef.refId.toString() : 'N/A',
        status: 'Created'
      });
    }
  }

  console.log(JSON.stringify({ results }, null, 2));
  await mongoose.disconnect();
}

setupAccounts().catch(err => {
  console.error(err.message);
  process.exit(1);
});
