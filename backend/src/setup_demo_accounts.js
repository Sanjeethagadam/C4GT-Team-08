const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupAccounts() {
  await mongoose.connect('mongodb://localhost:27017/academic_engagement_db');
  console.log(JSON.stringify({ status: 'Connected to DB' }));

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Branch = mongoose.model('Branch', new mongoose.Schema({}, { strict: false }));
  const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
  
  const branch = await Branch.findOne();
  if (!branch) throw new Error('No branches found in DB');
  
  const student = await Student.findOne();
  if (!student) throw new Error('No students found in DB');

  const passwordHash = await bcrypt.hash('password123', 10);
  
  const accountsToCreate = [
    {
      username: 'hod_demo',
      role: 'HOD',
      scopeRef: { type: 'Branch', refId: branch._id }
    },
    {
      username: 'principal_demo',
      role: 'PRINCIPAL'
    },
    {
      username: 'coordinator_demo',
      role: 'COORDINATOR',
      scopeRef: { type: 'Branch', refId: branch._id }
    },
    {
      username: 'student_demo',
      role: 'STUDENT',
      scopeRef: { type: 'Student', refId: student._id }
    }
  ];

  const results = [];

  for (const account of accountsToCreate) {
    const existing = await User.findOne({ username: account.username });
    if (existing) {
      results.push({
        username: account.username,
        role: account.role,
        scope: account.scopeRef ? account.scopeRef.type : 'Institution (None)',
        linkedId: account.scopeRef ? account.scopeRef.refId.toString() : 'N/A',
        status: 'Already Existed'
      });
    } else {
      await User.collection.insertOne({
        ...account,
        passwordHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      results.push({
        username: account.username,
        role: account.role,
        scope: account.scopeRef ? account.scopeRef.type : 'Institution (None)',
        linkedId: account.scopeRef ? account.scopeRef.refId.toString() : 'N/A',
        status: 'Created'
      });
    }
  }

  console.log(JSON.stringify({ results }, null, 2));
  await mongoose.disconnect();
}

setupAccounts().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
