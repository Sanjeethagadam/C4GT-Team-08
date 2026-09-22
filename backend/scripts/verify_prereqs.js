const mongoose = require('mongoose');
const User = require('../src/modules/academic-master/models/User');
const Branch = require('../src/modules/academic-master/models/Branch');
const AcademicYear = require('../src/modules/academic-master/models/AcademicYear');
const Semester = require('../src/modules/academic-master/models/Semester');
const Section = require('../src/modules/academic-master/models/Section');
const Student = require('../src/modules/academic-master/models/Student');
const Subject = require('../src/modules/academic-master/models/Subject');
const SubjectBranchMapping = require('../src/modules/academic-master/models/SubjectBranchMapping');
const CtpoAssignment = require('../src/modules/examination/models/CtpoAssignment');
const Examination = require('../src/modules/examination/models/Examination');
const Campus = require('../src/modules/academic-master/models/Campus');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');
  console.log('--- READ-ONLY VERIFICATION ---');
  
  // 1. CTPO User '23KTCAID'
  const user = await User.findOne({ username: '23KTCAID' });
  console.log('1. User 23KTCAID exists:', !!user);

  // 2. CAI Branch
  const branch = await Branch.findOne({ code: 'CAI' });
  console.log('2. CAI Branch exists:', !!branch);

  // 3. Academic Year 2026-27
  const academicYear = await AcademicYear.findOne({ $or: [{ academicYear: '2026-2027' }, { academicYear: '2026-27' }, { yearString: '2026-2027' }] });
  console.log('3. Academic Year 2026-27 exists:', !!academicYear);

  // 4. Semester 4-1
  const semester = await Semester.findOne({ semesterCode: '4-1' });
  console.log('4. Semester 4-1 exists:', !!semester);

  // 5. Section CAI-D
  const section = await Section.findOne({ sectionName: 'CAI-D' });
  console.log('5. Section CAI-D exists:', !!section);

  // 6 & 7. Students Count
  let studentCount = 0;
  const campus = await Campus.findOne({ code: { $in: ['K1', 'KIET'] } });
  if (campus && branch && semester && section) {
    studentCount = await Student.countDocuments({
      campusId: campus._id,
      branchId: branch._id,
      semesterId: semester._id,
      sectionId: section._id,
      studentCategory: 'DAY_SCHOLAR',
      year: 4
    });
  } else {
    // Try counting without campus
    if (branch && semester && section) {
        studentCount = await Student.countDocuments({
        branchId: branch._id,
        semesterId: semester._id,
        sectionId: section._id,
        studentCategory: 'DAY_SCHOLAR',
        year: 4
        });
    }
  }
  console.log('6 & 7. Students matching K1/CAI/4/4-1/CAI-D/DAY_SCHOLAR count:', studentCount);

  // 8. 4-1 CAI Subjects
  if (branch && semester) {
    const mappings = await SubjectBranchMapping.find({
      branchId: branch._id,
      semesterId: semester._id
    }).populate('subjectId');
    console.log('8. 4-1 CAI Subjects Mapped Count:', mappings.length);
    mappings.forEach(m => console.log('   - ' + m.subjectId.subjectName));
  }

  // 9. Active CtpoAssignment
  if (campus && branch && academicYear && semester && section) {
    const ctpoAssign = await CtpoAssignment.findOne({
      campusId: campus._id,
      branchId: branch._id,
      academicYearId: academicYear._id,
      semesterId: semester._id,
      sectionId: section._id,
      studentCategory: 'DAY_SCHOLAR',
      status: 'ACTIVE'
    });
    console.log('9. Active CtpoAssignment exists for scope:', !!ctpoAssign);
  } else {
    console.log('9. Active CtpoAssignment check skipped due to missing references.');
  }

  // 10. MID1 Examination for 2026-27 / 4-1
  if (academicYear && semester) {
    const exam = await Examination.findOne({
      examType: 'MID1',
      academicYearId: academicYear._id,
      semesterId: semester._id
    });
    console.log('10. MID1 examination exists for 2026-27/4-1:', !!exam);
  } else {
    console.log('10. MID1 exam check skipped due to missing references.');
  }

  process.exit(0);
}
run();
