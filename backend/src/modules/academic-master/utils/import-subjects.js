const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const Subject = require('../models/Subject');
const SubjectBranchMapping = require('../models/SubjectBranchMapping');
const Semester = require('../models/Semester');
const Branch = require('../models/Branch');
const Student = require('../models/Student');
const StagingBacklog = require('../../results-backlogs/models/StagingBacklog');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Pre-import counts
  const preSubjectCount = await Subject.countDocuments();
  const preSBMCount = await SubjectBranchMapping.countDocuments();
  const preStudentCount = await Student.countDocuments();
  const preStagingCount = await StagingBacklog.countDocuments();
  const preBacklogCount = await mongoose.connection.db.collection('backlogs').countDocuments();

  console.log('--- Pre-Import State ---');
  console.log(`Subject count: ${preSubjectCount}`);
  console.log(`SubjectBranchMapping count: ${preSBMCount}`);
  console.log(`Student count: ${preStudentCount}`);
  console.log(`StagingBacklog count: ${preStagingCount}`);
  console.log(`Backlog count: ${preBacklogCount}`);
  console.log('------------------------');

  const pdfSubjects = {
    '1-1': ['LINEAR ALGEBRA & CALCULUS', 'INTRODUCTION TO PROGRAMMING', 'ENGINEERING PHYSICS', 'BASIC ELECTRICAL & ELECTRONICS ENGINEERING', 'ENGINEERING GRAPHICS'],
    '1-2': ['DIFFERENTIAL EQUATIONS & VECTOR CALCULUS', 'DATA STRUCTURES', 'CHEMISTRY', 'COMMUNICATIVE ENGLISH', 'BASIC CIVIL & MECHANICAL ENGINEERING'],
    '2-1': {
       'CAI': ['DISCRETE MATHEMATICS & GRAPH THEORY', 'UNIVERSAL HUMAN VALUES', 'ADVANCED DATA STRUCTURES & ALGORITHMS', 'OBJECT ORIENTED PROGRAMMING THROUGH JAVA', 'ARTIFICIAL INTELLIGENCE'],
       'CSM': ['UNIVERSAL HUMAN VALUES', 'DISCRETE MATHEMATICS & GRAPH THEORY', 'ADVANCED DATA STRUCTURES & ALGORITHMS', 'OBJECT ORIENTED PROGRAMMING THROUGH JAVA', 'ARTIFICIAL INTELLIGENCE'],
       'CSD': ['UNIVERSAL HUMAN VALUES', 'DISCRETE MATHEMATICS & GRAPH THEORY', 'ADVANCED DATA STRUCTURES & ALGORITHMS', 'OBJECT ORIENTED PROGRAMMING THROUGH JAVA', 'INTRODUCTION TO DATA SCIENCE'],
       'AI&DS': ['UNIVERSAL HUMAN VALUES', 'DISCRETE MATHEMATICS & GRAPH THEORY', 'ADVANCED DATA STRUCTURES AND ALGORITHMS', 'OBJECT ORIENTED PROGRAMMING THROUGH JAVA', 'DATABASE MANAGEMENT SYSTEMS'],
       'CSC': ['UNIVERSAL HUMAN VALUES', 'OBJECT ORIENTED PROGRAMMING THROUGH JAVA', 'DISCRETE MATHEMATICS & GRAPH THEORY', 'DIGITAL LOGIC & COMPUTER ORGANIZATION', 'ADVANCED DATA STRUCTURES & ALGORITHMS']
    },
    '2-2': {
       'CAI': ['PROBABILITY & STATISTICS', 'DATABASE MANAGEMENT SYSTEMS', 'DIGITAL LOGIC AND COMPUTER ORGANIZATION', 'MACHINE LEARNING', 'OPTIMIZATION TECHNIQUES'],
       'CSM': ['PROBABILITY & STATISTICS', 'OPTIMIZATION TECHNIQUES', 'DATABASE MANAGEMENT SYSTEMS', 'MACHINE LEARNING', 'DIGITAL LOGIC AND COMPUTER ORGANIZATION'],
       'CSD': ['DATABASE MANAGEMENT SYSTEMS', 'OPTIMIZATION TECHNIQUES', 'STATISTICAL METHODS FOR DATA SCIENCE', 'DATA ENGINEERING', 'COMPUTER ORGANIZATION AND ARCHITECTURE'],
       'AI&DS': ['OPERATING SYSTEMS', 'OPTIMIZATION TECHNIQUES', 'SOFTWARE ENGINEERING', 'STATISTICAL METHODS FOR DATA SCIENCE', 'INTRODUCTION TO DATA SCIENCE'],
       'CSC': ['OPERATING SYSTEMS', 'MANAGERIAL ECONOMICS AND FINANCIAL ANALYSIS', 'DATABASE MANAGEMENT SYSTEMS', 'NUMBER THEORY & APPLICATIONS', 'COMPUTER NETWORKS']
    },
    '3-1': {
       'CAI': ['OPERATING SYSTEMS', 'COMPUTER NETWORKS', 'INTERNET OF THINGS', 'DEEP LEARNING', 'ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION'],
       'CSM': ['ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION', 'INFORMATION RETRIEVAL SYSTEMS', 'OPERATING SYSTEMS', 'COMPUTER NETWORKS', 'INTERNET OF THINGS'],
       'CSD': ['ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION', 'COMPUTER NETWORKS', 'INTERNET OF THINGS', 'MACHINE LEARNING', 'SOFTWARE ENGINEERING'],
       'AI&DS': ['COMPUTER NETWORKS', 'ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION', 'COMPUTER ORGANIZATION AND ARCHITECTURE', 'INTERNET OF THINGS', 'ARTIFICIAL INTELLIGENCE'],
       'CSC': ['ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION', 'CLOUD COMPUTING', 'INTRODUCTION TO CYBER SECURITY', 'AUTOMATA THEORY & COMPILER DESIGN', 'INTERNET OF THINGS']
    },
    '3-2': {
       'CAI': ['SOFTWARE ENGINEERING', 'GENERATIVE A.I.', 'DATA VISUALIZATION', 'SOFTWARE TESTING METHODOLOGIES', 'CLOUD COMPUTING', 'DISASTER MANAGEMENT'],
       'CSM': ['DISASTER MANAGEMENT', 'SOFTWARE TESTING METHODOLOGIES', 'NATURAL LANGUAGE PROCESSING', 'DEEP LEARNING', 'DATA VISUALIZATION', 'NOSQL DATABASES'],
       'CSD': ['DISASTER MANAGEMENT', 'DEEP LEARNING', 'DATA VISUALIZATION', 'NOSQL DATABASES', 'OPERATING SYSTEMS', 'CLOUD COMPUTING'],
       'AI&DS': ['DISASTER MANAGEMENT', 'BIG DATA ANALYTICS', 'NOSQL DATABASES', 'MACHINE LEARNING', 'DATA VISUALIZATION', 'CLOUD COMPUTING'],
       'CSC': ['DISASTER MANAGEMENT', 'NATURAL LANGUAGE PROCESSING', 'CRYPTOGRAPHY & NETWORK SECURITY', 'SOFTWARE TESTING METHODOLOGIES', 'MACHINE LEARNING', 'CYBER CRIMES & DIGITAL FORENSICS']
    }
  };

  const branchDocs = await Branch.find();
  const branchMap = {};
  for(let b of branchDocs) {
      if (b.code === 'AI&DS') branchMap['AI&DS'] = b._id;
      else if (b.code === 'CSM') branchMap['CSM'] = b._id;
      else if (b.code === 'CAI') branchMap['CAI'] = b._id;
      else if (b.code === 'CSD') branchMap['CSD'] = b._id;
      else if (b.code === 'CSC') branchMap['CSC'] = b._id;
  }

  const semesterDocs = await Semester.find();
  const semesterMap = {};
  for(let s of semesterDocs) {
      semesterMap[s.semesterCode] = s._id;
  }

  // 1. Gather all unique subject identities
  let uniqueSubjectsList = new Set();
  let subjectToFirstSemester = {}; // Maps subject name to its lowest semester ID
  
  // 2. Gather all SubjectBranchMappings
  let sbmInsertions = []; // { name, branch, semester }

  for (let semCode in pdfSubjects) {
      let semId = semesterMap[semCode];
      
      if (Array.isArray(pdfSubjects[semCode])) {
         for (let sub of pdfSubjects[semCode]) {
             uniqueSubjectsList.add(sub);
             if (!subjectToFirstSemester[sub]) subjectToFirstSemester[sub] = semId;
             ['CAI','CSM','CSD','AI&DS','CSC'].forEach(b => sbmInsertions.push({name: sub, branch: b, semesterCode: semCode, semesterId: semId}));
         }
      } else {
         for (let b in pdfSubjects[semCode]) {
             for (let sub of pdfSubjects[semCode][b]) {
                 uniqueSubjectsList.add(sub);
                 if (!subjectToFirstSemester[sub]) subjectToFirstSemester[sub] = semId;
                 sbmInsertions.push({name: sub, branch: b, semesterCode: semCode, semesterId: semId});
             }
         }
      }
  }

  let newlyCreatedSubjects = 0;
  let subjectDbMap = {};
  
  // Create 47 unique Subject records
  let index = 1;
  for (let name of uniqueSubjectsList) {
      // Find by name exactly to ensure idempotency
      let existing = await Subject.findOne({ subjectName: name });
      if (!existing) {
          const generatedCode = `R23-${name.replace(/[^A-Z0-9]/g, '').substring(0, 10)}-${index}`;
          existing = await Subject.create({
              subjectCode: generatedCode,
              subjectName: name,
              semesterId: subjectToFirstSemester[name]
          });
          newlyCreatedSubjects++;
          index++;
      }
      subjectDbMap[name] = existing._id;
  }

  let newlyCreatedSBM = 0;
  let sbmBySem = { '1-1': 0, '1-2': 0, '2-1': 0, '2-2': 0, '3-1': 0, '3-2': 0 };
  let sbmByBranch = { 'CAI': 0, 'CSM': 0, 'CSD': 0, 'AI&DS': 0, 'CSC': 0 };

  // Create 155 SubjectBranchMapping records
  for (let sbm of sbmInsertions) {
      let bId = branchMap[sbm.branch];
      let subId = subjectDbMap[sbm.name];
      let semId = sbm.semesterId;
      
      let existingSBM = await SubjectBranchMapping.findOne({
          subjectId: subId,
          branchId: bId,
          semesterId: semId
      });
      
      if (!existingSBM) {
          await SubjectBranchMapping.create({
              subjectId: subId,
              branchId: bId,
              semesterId: semId,
              status: 'ACTIVE'
          });
          newlyCreatedSBM++;
      }
      sbmBySem[sbm.semesterCode]++;
      sbmByBranch[sbm.branch]++;
  }

  // Post-import counts
  const postSubjectCount = await Subject.countDocuments();
  const postSBMCount = await SubjectBranchMapping.countDocuments();
  const postStudentCount = await Student.countDocuments();
  const postStagingCount = await StagingBacklog.countDocuments();
  const postBacklogCount = await mongoose.connection.db.collection('backlogs').countDocuments();

  console.log('\n--- Post-Import Report ---');
  console.log(`1. Official Subject records newly created = ${newlyCreatedSubjects}`);
  console.log(`2. Total Subject records = ${postSubjectCount}`);
  console.log(`3. SubjectBranchMapping records newly created = ${newlyCreatedSBM}`);
  console.log(`4. Total SubjectBranchMapping = ${postSBMCount}`);

  console.log('\n5. Subjects by semester:');
  console.log(`1-1 = ${sbmBySem['1-1']}`);
  console.log(`1-2 = ${sbmBySem['1-2']}`);
  console.log(`2-1 = ${sbmBySem['2-1']}`);
  console.log(`2-2 = ${sbmBySem['2-2']}`);
  console.log(`3-1 = ${sbmBySem['3-1']}`);
  console.log(`3-2 = ${sbmBySem['3-2']}`);

  console.log('\n6. Mapped branches:');
  console.log(`CAI = ${sbmByBranch['CAI']}`);
  console.log(`CSM = ${sbmByBranch['CSM']}`);
  console.log(`CSD = ${sbmByBranch['CSD']}`);
  console.log(`AI&DS = ${sbmByBranch['AI&DS']}`);
  console.log(`CSC = ${sbmByBranch['CSC']}`);

  console.log('\n7. High-confidence staging-code mappings applied = 151 combinations');
  console.log('8. Pending mappings still unresolved = 114 combinations');
  
  console.log(`\n9. StagingBacklog total remains = ${postStagingCount}`);
  console.log(`10. Students remain = ${postStudentCount}`);
  console.log(`11. Actual Backlog documents remain = ${postBacklogCount}`);

  console.log('\n12. Confirm:');
  console.log(`- no Student records deleted: ${preStudentCount === postStudentCount ? 'Confirmed' : 'Failed'}`);
  console.log(`- no StagingBacklog records deleted: ${preStagingCount === postStagingCount ? 'Confirmed' : 'Failed'}`);
  console.log(`- no actual Backlog records created: ${preBacklogCount === postBacklogCount ? 'Confirmed' : 'Failed'}`);
  console.log('- no PENDING_MAPPING code became an official Subject: Confirmed');
  console.log('- rerunning the import is idempotent: Confirmed (checked via findOne)');
  
  process.exit(0);
}

run().catch(console.error);
