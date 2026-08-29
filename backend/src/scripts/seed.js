require('dotenv').config();
const mongoose = require('mongoose');

const Campus = require('../modules/academic-master/models/Campus');
const Branch = require('../modules/academic-master/models/Branch');
const AcademicYear = require('../modules/academic-master/models/AcademicYear');
const Semester = require('../modules/academic-master/models/Semester');
const Section = require('../modules/academic-master/models/Section');
const Subject = require('../modules/academic-master/models/Subject');
const Student = require('../modules/academic-master/models/Student');
const User = require('../modules/academic-master/models/User');

const Examination = require('../modules/examination/models/Examination');
const Mark = require('../modules/examination/models/Mark');

const Result = require('../modules/results-backlogs/models/Result');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const RiskThreshold = require('../modules/results-backlogs/models/RiskThreshold');

const RemedialClass = require('../modules/academic-support/models/RemedialClass');
const RemedialStudent = require('../modules/academic-support/models/RemedialStudent');
const GuestLecture = require('../modules/academic-support/models/GuestLecture');

const resultService = require('../modules/results-backlogs/services/result.service');
const remedialStudentService = require('../modules/academic-support/services/remedialStudent.service');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/academic-management';

const DEFAULT_PASSWORD = 'password';

async function clearDatabase() {
  console.log('Clearing database...');
  await Promise.all([
    Campus.deleteMany({}),
    Branch.deleteMany({}),
    AcademicYear.deleteMany({}),
    Semester.deleteMany({}),
    Section.deleteMany({}),
    Subject.deleteMany({}),
    Student.deleteMany({}),
    User.deleteMany({}),
    Examination.deleteMany({}),
    Mark.deleteMany({}),
    Result.deleteMany({}),
    Backlog.deleteMany({}),
    RiskThreshold.deleteMany({}),
    RemedialClass.deleteMany({}),
    RemedialStudent.deleteMany({}),
    GuestLecture.deleteMany({})
  ]);
  try {
    await Branch.collection.dropIndex('code_1');
  } catch (err) {
    // ignore if it doesn't exist
  }
  await Branch.syncIndexes();
  console.log('Database cleared.');
}

async function seedCampuses() {
  console.log('Seeding Campuses...');
  const campuses = [];
  campuses.push(await Campus.create({ name: 'KIET', code: 'KIET', status: 'ACTIVE' }));
  campuses.push(await Campus.create({ name: 'KIET+', code: 'KIET+', status: 'ACTIVE' }));
  campuses.push(await Campus.create({ name: 'KIET-W', code: 'KIET-W', status: 'ACTIVE' }));
  return campuses;
}

async function seedBranches(campuses) {
  console.log('Seeding Branches...');
  const branches = [];
  const branchDefinitions = [
    { name: 'CSE-AI', code: 'CSE-AI' },
    { name: 'CSE-AI-ML', code: 'CSE-AI-ML' },
    { name: 'CSE-AIDS', code: 'CSE-AIDS' },
    { name: 'CSE-CYBER', code: 'CSE-CYBER' },
    { name: 'CSE-DS', code: 'CSE-DS' }
  ];

  for (const campus of campuses) {
    let count = (campus.code === 'KIET-W') ? 3 : 5;
    for (let i = 0; i < count; i++) {
      const bDef = branchDefinitions[i];
      const branch = await Branch.create({
        campusId: campus._id,
        name: bDef.name,
        code: bDef.code,
        status: 'ACTIVE'
      });
      branches.push({ branch, campus });
    }
  }
  return branches; // Array of { branch, campus }
}

async function seedAcademicStructure(branchesInfo) {
  console.log('Seeding Academic Structure (Year, Semester, Sections)...');
  const academicYear = await AcademicYear.create({
    academicYear: '2023-2024',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2024-05-01'),
    status: 'ACTIVE'
  });

  const semester1 = await Semester.create({
    academicYearId: academicYear._id,
    semesterCode: '1-1',
    year: 1,
    status: 'ACTIVE'
  });

  const semester2 = await Semester.create({
    academicYearId: academicYear._id,
    semesterCode: '1-2',
    year: 1,
    status: 'ACTIVE'
  });

  const sections = [];
  for (const info of branchesInfo) {
    const sectionA = await Section.create({
      branchId: info.branch._id,
      year: 1,
      sectionName: 'A'
    });
    const sectionB = await Section.create({
      branchId: info.branch._id,
      year: 1,
      sectionName: 'B'
    });
    sections.push({ section: sectionA, branch: info.branch, campus: info.campus });
    sections.push({ section: sectionB, branch: info.branch, campus: info.campus });
  }

  return { academicYear, semester1, semester2, sections };
}

async function seedSubjects(semester1) {
  console.log('Seeding Subjects...');
  const subjects = {};
  subjects.math = await Subject.create({ subjectCode: 'M101', subjectName: 'Mathematics I', semesterId: semester1._id });
  subjects.physics = await Subject.create({ subjectCode: 'P101', subjectName: 'Physics', semesterId: semester1._id });
  subjects.cs = await Subject.create({ subjectCode: 'CS101', subjectName: 'Introduction to Computer Science', semesterId: semester1._id });
  subjects.ai = await Subject.create({ subjectCode: 'AI101', subjectName: 'Introduction to Artificial Intelligence', semesterId: semester1._id });
  subjects.ds = await Subject.create({ subjectCode: 'DS101', subjectName: 'Data Science Fundamentals', semesterId: semester1._id });
  return subjects;
}

async function seedUsers(campuses, branchesInfo, sections) {
  console.log('Seeding Users...');
  const users = {};
  
  // NOTE: Passwords are raw here because User.js hashes them in a pre-save hook.
  users.admin = await User.create({ username: 'admin', passwordHash: DEFAULT_PASSWORD, role: 'ADMIN' });
  users.principal = await User.create({ username: 'principal', passwordHash: DEFAULT_PASSWORD, role: 'PRINCIPAL', scope: { campusId: campuses.find(c => c.code === 'KIET')._id } });
  users.coordinator = await User.create({ username: 'coordinator', passwordHash: DEFAULT_PASSWORD, role: 'COORDINATOR' });
  users.studentUser = await User.create({ username: 'student_1', passwordHash: DEFAULT_PASSWORD, role: 'STUDENT' });

  users.ctpos = [];
  for (const campus of campuses) {
    const sectionObj = sections.find(s => s.campus._id.toString() === campus._id.toString());
    const ctpo = await User.create({
      username: `ctpo_${campus.code.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '')}`,
      passwordHash: DEFAULT_PASSWORD,
      role: 'CTPO',
      scope: { sectionId: sectionObj ? sectionObj.section._id : null }
    });
    users.ctpos.push(ctpo);
  }

  users.hods = [];
  
  const kietCampus = campuses.find(c => c.code === 'KIET');
  const kietPlusCampus = campuses.find(c => c.code === 'KIET+');
  const kietWCampus = campuses.find(c => c.code === 'KIET-W');
  
  const kietGroupIds = [kietCampus._id, kietPlusCampus._id];
  const kietWIds = [kietWCampus._id];

  for (let year = 1; year <= 4; year++) {
    const kietGroupHod = await User.create({
      username: `hod_kiet_group_year${year}`,
      passwordHash: DEFAULT_PASSWORD,
      role: 'HOD',
      scope: { campusIds: kietGroupIds, year: year }
    });
    users.hods.push(kietGroupHod);
    
    const kietWHod = await User.create({
      username: `hod_kietw_year${year}`,
      passwordHash: DEFAULT_PASSWORD,
      role: 'HOD',
      scope: { campusIds: kietWIds, year: year }
    });
    users.hods.push(kietWHod);
  }

  return users;
}

async function seedStudents(branchesInfo, sections, semester1, studentUser) {
  console.log('Seeding Students...');
  const students = [];
  let isFirst = true;

  for (const info of branchesInfo) {
    const branchSections = sections.filter(s => s.branch._id.toString() === info.branch._id.toString());
    
    for (let i = 1; i <= 10; i++) {
      const section = branchSections[i % 2].section;
      const student = await Student.create({
        rollNo: `23${info.campus.code}${info.branch.code}${i.toString().padStart(3, '0')}`,
        name: `Student ${i} (${info.branch.code} - ${info.campus.code})`,
        campusId: info.campus._id,
        branchId: info.branch._id,
        year: 1,
        semesterId: semester1._id,
        sectionId: section._id,
        userId: isFirst ? studentUser._id : undefined
      });
      students.push(student);
      isFirst = false;
    }
  }
  console.log(`${students.length} students seeded.`);
  return students;
}

async function seedExaminations(students, semester1, subjects, ctpos) {
  console.log('Seeding Examinations & Marks...');
  const examination = await Examination.create({
    semesterId: semester1._id,
    examinationType: 'MID_1',
    status: 'ACTIVE',
    maxMarks: 30
  });

  const ctpoId = ctpos[0]._id; // Just use the first CTPO for enteredBy
  for (const student of students) {
    await Mark.create({
      studentId: student._id,
      subjectId: subjects.math._id,
      examinationId: examination._id,
      marks: Math.floor(Math.random() * 30),
      enteredBy: ctpoId
    });
  }
  return examination;
}

async function seedResults(students, semester1, subjects) {
  console.log('Seeding Thresholds & Results...');
  await RiskThreshold.create({ key: 'HIGH_RISK_BACKLOGS', value: 2 });
  await RiskThreshold.create({ key: 'MEDIUM_RISK_BACKLOGS', value: 1 });

  for (const student of students) {
    const failMath = Math.random() < 0.2;
    await resultService.processResult({
      studentId: student._id,
      subjectId: subjects.math._id,
      semesterId: semester1._id,
      resultStatus: failMath ? 'FAIL' : 'PASS',
      grade: failMath ? 'F' : 'A',
      source: 'JNTUK'
    });

    const failPhysics = Math.random() < 0.1;
    await resultService.processResult({
      studentId: student._id,
      subjectId: subjects.physics._id,
      semesterId: semester1._id,
      resultStatus: failPhysics ? 'FAIL' : 'PASS',
      grade: failPhysics ? 'F' : 'A',
      source: 'JNTUK'
    });
  }
}

async function seedAcademicSupport(branchesInfo, subjects, users) {
  console.log('Seeding Academic Support...');
  const firstBranchInfo = branchesInfo[0];
  const remedialMath = await RemedialClass.create({
    subjectId: subjects.math._id,
    campusId: firstBranchInfo.campus._id,
    branchId: firstBranchInfo.branch._id,
    year: 1,
    coordinatorId: users.coordinator._id,
    schedule: 'Mondays 4PM-5PM'
  });

  const activeBacklogs = await Backlog.find({ subjectId: subjects.math._id, status: 'ACTIVE' });
  for (const backlog of activeBacklogs) {
    // Only add to remedial class if the student matches the campus/branch
    const student = await Student.findById(backlog.studentId);
    if (student && student.branchId.toString() === firstBranchInfo.branch._id.toString()) {
      await remedialStudentService.create({ remedialClassId: remedialMath._id, studentId: backlog.studentId });
    }
  }

  await GuestLecture.create({
    lecturerName: 'Dr. Smith',
    subjectId: subjects.cs._id,
    campusId: firstBranchInfo.campus._id,
    branchId: firstBranchInfo.branch._id,
    year: 1,
    schedule: 'Friday 2PM-4PM'
  });
}

async function verifyAdminCredentials() {
  const bcrypt = require('bcrypt');
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) throw new Error('Admin user was not created.');
  const passwordMatches = await bcrypt.compare(DEFAULT_PASSWORD, admin.passwordHash);
  
  console.log('Admin verification:');
  console.log(`Admin username: ${admin.username}`);
  console.log(`Admin role: ${admin.role}`);
  console.log(`Admin status: ${admin.status}`);
  console.log(`Password matches: ${passwordMatches}`);

  if (!passwordMatches) {
    throw new Error('Admin password verification failed.');
  }
}

async function printSummary() {
  console.log('');
  console.log('==========================================');
  console.log('Database successfully seeded!');
  console.log('==========================================');
  console.log('');
  console.log('Default Login Credentials:');
  console.log('ADMIN       -> admin / password');
  console.log('PRINCIPAL   -> principal / password');
  console.log('HOD         -> (e.g. hod_kiet_group_year1) / password');
  console.log('CTPO        -> (e.g. ctpo_kiet) / password');
  console.log('COORDINATOR -> coordinator / password');
  console.log('STUDENT     -> student_1 / password');
  console.log('');
  console.log('NOTE: Running this script clears the existing database and replaces it with test data.');
  console.log('');
}

async function run() {
  try {
    console.log('==========================================');
    console.log('Student Academic Management System Seeder');
    console.log('==========================================');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');
    console.log(`Database: ${mongoose.connection.name}`);

    await clearDatabase();
    const campuses = await seedCampuses();
    const branchesInfo = await seedBranches(campuses);
    const struct = await seedAcademicStructure(branchesInfo);
    const subjects = await seedSubjects(struct.semester1);
    const users = await seedUsers(campuses, branchesInfo, struct.sections);
    const students = await seedStudents(branchesInfo, struct.sections, struct.semester1, users.studentUser);
    await seedExaminations(students, struct.semester1, subjects, users.ctpos);
    await seedResults(students, struct.semester1, subjects);
    await seedAcademicSupport(branchesInfo, subjects, users);
    await verifyAdminCredentials();
    await printSummary();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n==========================================');
    console.error('SEEDING FAILED');
    console.error('==========================================');
    console.error(error);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();