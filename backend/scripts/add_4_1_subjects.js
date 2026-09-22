const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Subject = require('../src/modules/academic-master/models/Subject');
const SubjectBranchMapping = require('../src/modules/academic-master/models/SubjectBranchMapping');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');

const data = [
  {
    branchCode: 'CAI',
    subjects: [
      'Natural Language Processing',
      'Human Resource & Project Management',
      'Software Architecture & Design Pattern',
      'NPTEL',
      'Concepts of Smart Grid Technologies',
      'Embedded Systems',
      'Prompt Engineering'
    ]
  },
  {
    branchCode: 'CSM',
    subjects: [
      'Reinforcement Learning',
      'Human Resource & Project Management',
      'NPTEL',
      'Big Data Analytics',
      'Concepts of Smart Grid Technologies',
      'Embedded Systems',
      'Prompt Engineering/Swayam+'
    ]
  },
  {
    branchCode: 'CSD',
    subjects: [
      'Big Data Analytics',
      'Human Resource & Project Management',
      'Blockchain Technology',
      'NPTEL',
      'Concepts of Smart Grid Technologies',
      'Embedded Systems',
      'Full Stack Development -2 SWAYAM Plus - Certificate Course on Data Analytics'
    ]
  },
  {
    branchCode: 'AI&DS',
    subjects: [
      'Deep Learning',
      'Human Resource & Project Management',
      'Software Architecture & Design Pattern',
      'NPTEL',
      'Concepts of Smart Grid Technologies',
      'Embedded Systems',
      'Prompt Engineering'
    ]
  },
  {
    branchCode: 'CSC',
    subjects: [
      'Blockchain Technology',
      'Human Resource & Project Management',
      'NPTEL',
      'Intrusion Detection and Prevention System',
      'Concepts of Smart Grid Technologies',
      'Embedded Systems',
      'Ethical Hacking'
    ]
  }
];

function generateSubjectCode(name) {
  return name.split(/[\s-&/]+/).map(word => {
    return word.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase();
  }).join('') + '-' + Math.floor(1000 + Math.random() * 9000); 
}

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');
    console.log('Connected to DB');

    const semester = await Semester.findOne({ semesterCode: '4-1' });
    if (!semester) {
      console.log('4-1 Semester not found!');
      process.exit(1);
    }
    
    let addedSubjectsCount = 0;
    let addedMappingsCount = 0;

    for (const branchData of data) {
      const branch = await Branch.findOne({ code: branchData.branchCode });
      if (!branch) {
        console.log(`Branch ${branchData.branchCode} not found! Skipping...`);
        continue;
      }

      for (const subjectName of branchData.subjects) {
        let subject = await Subject.findOne({ subjectName: subjectName });
        
        if (!subject) {
          const code = generateSubjectCode(subjectName);
          subject = await Subject.create({
            subjectCode: code,
            subjectName: subjectName,
            semesterId: semester._id
          });
          addedSubjectsCount++;
          console.log(`Created subject: ${subjectName} (${code})`);
        }

        const mappingExists = await SubjectBranchMapping.findOne({
          subjectId: subject._id,
          branchId: branch._id,
          semesterId: semester._id
        });

        if (!mappingExists) {
          await SubjectBranchMapping.create({
            subjectId: subject._id,
            branchId: branch._id,
            semesterId: semester._id,
            status: 'ACTIVE'
          });
          addedMappingsCount++;
          console.log(`Mapped ${subjectName} to ${branchData.branchCode}`);
        }
      }
    }

    console.log(`\nDone! Added ${addedSubjectsCount} new subjects and ${addedMappingsCount} mappings.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
