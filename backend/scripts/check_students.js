const mongoose = require('mongoose');
const Student = require('../src/modules/academic-master/models/Student');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');
const Campus = require('../src/modules/academic-master/models/Campus');
const Section = require('../src/modules/academic-master/models/Section'); 

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');
    console.log('--- READ-ONLY STUDENT ANALYSIS ---');

    const branch = await Branch.findOne({ code: 'CAI' });
    if (!branch) {
      console.log('Branch CAI not found in database.');
      process.exit(1);
    }

    const semester = await Semester.findOne({ semesterCode: '4-1' });

    // 1. Total students with branch = CAI and year = 4
    const studentsCai4 = await Student.find({ branchId: branch._id, year: 4 })
      .populate('campusId branchId semesterId sectionId');
    
    console.log(`1. Total students with branch = CAI and year = 4: ${studentsCai4.length}`);

    // 2. How many have semester = 4-1
    let countSemester41 = 0;
    const sample41 = [];
    
    studentsCai4.forEach(student => {
      // Semester may be populated or not, checking the semesterCode if populated
      if (student.semesterId && (student.semesterId._id.equals(semester?._id) || student.semesterId.semesterCode === '4-1')) {
        countSemester41++;
        if (sample41.length < 5) {
          sample41.push(student);
        }
      }
    });

    console.log(`2. Total students with semester = 4-1: ${countSemester41}`);

    // 3. Show a sample of matching students
    console.log('\n3. Sample of matching students:');
    if (sample41.length === 0) {
      console.log('No students found for 4-1.');
    } else {
      sample41.forEach(s => {
        console.log(`- HTNO: ${s.htno}`);
        console.log(`  Name: ${s.name}`);
        console.log(`  Campus: ${s.campusId ? s.campusId.code : 'N/A'}`);
        console.log(`  Branch: ${s.branchId ? s.branchId.code : 'N/A'}`);
        console.log(`  Year: ${s.year}`);
        console.log(`  Semester: ${s.semesterId ? s.semesterId.semesterCode : 'N/A'}`);
        console.log(`  Section: ${s.sectionId ? s.sectionId.sectionName : 'N/A'}`);
        console.log(`  Student Category: ${s.studentCategory || 'MISSING'}\n`);
      });
    }

    // 4. Can they be assigned to CAI-D / DAY_SCHOLAR?
    // They need a valid sectionId corresponding to CAI-D, and studentCategory = DAY_SCHOLAR
    console.log('4. Analysis of assignment readiness:');
    const missingCategory = studentsCai4.filter(s => !s.studentCategory).length;
    const missingSection = studentsCai4.filter(s => !s.sectionId).length;
    
    console.log(`   - Students missing studentCategory: ${missingCategory}`);
    console.log(`   - Students missing sectionId: ${missingSection}`);
    
    let caiDSection = await Section.findOne({ sectionName: 'CAI-D' });
    if (!caiDSection) {
      console.log(`   - The Section 'CAI-D' does NOT exist in the Section collection.`);
    } else {
      const inCaiD = studentsCai4.filter(s => s.sectionId && s.sectionId._id.equals(caiDSection._id)).length;
      console.log(`   - Students explicitly mapped to section CAI-D: ${inCaiD}`);
    }

    if (missingCategory > 0 || missingSection > 0) {
      console.log(`   -> CONCLUSION: The students cannot be fully assigned yet because many lack 'studentCategory' or 'sectionId'.`);
    } else if (!caiDSection) {
      console.log(`   -> CONCLUSION: Cannot assign to CAI-D because the section does not exist in the database.`);
    }

    // 5 & 6. Student schema check
    console.log('\n5 & 6. Schema Information:');
    const schemaPaths = Object.keys(Student.schema.paths);
    if (schemaPaths.includes('studentCategory')) {
      const options = Student.schema.paths['studentCategory'].enumValues;
      console.log(`   - The Student schema currently has 'studentCategory' field.`);
      console.log(`   - Enum values allowed: [${options.join(', ')}]`);
      if (missingCategory > 0) {
        console.log(`   - However, existing imported students do not have this field populated.`);
      }
    } else {
      console.log(`   - The Student schema is MISSING the 'studentCategory' field entirely.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
