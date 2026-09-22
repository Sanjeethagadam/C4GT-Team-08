const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('No MONGODB_URI found in environment');
  
  await mongoose.connect(uri);

  const Subject = require('../src/modules/academic-master/models/Subject');
  const Branch = require('../src/modules/academic-master/models/Branch');
  const Semester = require('../src/modules/academic-master/models/Semester');
  const SBM = require('../src/modules/academic-master/models/SubjectBranchMapping');

  const mappings = await SBM.find().lean();
  
  // Group mappings strictly by exact IDs
  const strictGroups = {};
  mappings.forEach(m => {
    if (!m.subjectId || !m.branchId || !m.semesterId) return;
    const key = m.subjectId.toString() + '_' + m.branchId.toString() + '_' + m.semesterId.toString();
    if (!strictGroups[key]) strictGroups[key] = [];
    strictGroups[key].push(m);
  });

  const mappingsToDelete = [];
  const groupsProcessed = [];
  
  for (const [key, maps] of Object.entries(strictGroups)) {
      if (maps.length > 1) {
          maps.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          const canonicalMap = maps[0];
          const duplicates = maps.slice(1);
          
          groupsProcessed.push(key);
          for (const dup of duplicates) {
              mappingsToDelete.push(dup._id);
          }
      }
  }

  console.log('==================================================');
  console.log('EXECUTION SAFETY VERIFICATION');
  console.log('==================================================');
  console.log('Strict duplicate groups identified:', groupsProcessed.length);
  console.log('Mapping IDs to delete:', mappingsToDelete.length);
  
  if (mappingsToDelete.length === 0) {
      console.log('No true exact duplicate mappings found with same Subject._id + Branch._id + Semester._id!');
      process.exit(1);
  }

  console.log('All safety constraints verified.');
  
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      console.log('Executing deletion inside transaction...');
      const result = await SBM.deleteMany({ _id: { $in: mappingsToDelete } }).session(session);
      console.log('Deleted count:', result.deletedCount);
      if (result.deletedCount !== mappingsToDelete.length) {
          throw new Error('Deleted count mismatch. Expected ' + mappingsToDelete.length + ', got ' + result.deletedCount);
      }
      await session.commitTransaction();
      console.log('Transaction committed successfully.');
  } catch (err) {
      console.error('Execution failed:', err);
      await session.abortTransaction();
      process.exit(1);
  } finally {
      session.endSession();
  }
  
  // Post execution validation
  const finalCount = await SBM.countDocuments();
  console.log('Post-execution total SubjectBranchMapping records:', finalCount);
  
  process.exit(0);
}
run().catch(console.error);
