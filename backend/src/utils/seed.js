require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../modules/academic-master/models/User');
const Campus = require('../modules/academic-master/models/Campus');
const Branch = require('../modules/academic-master/models/Branch');
const CampusBranchAvailability = require('../modules/academic-master/models/CampusBranchAvailability');
const AcademicYear = require('../modules/academic-master/models/AcademicYear');
const Semester = require('../modules/academic-master/models/Semester');
const Subject = require('../modules/academic-master/models/Subject');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Campus.deleteMany(),
      Branch.deleteMany(),
      CampusBranchAvailability.deleteMany(),
      AcademicYear.deleteMany(),
      Semester.deleteMany(),
      Subject.deleteMany()
    ]);

    console.log('Seeding Campuses...');
    const campuses = await Campus.insertMany([
      { name: 'KIET', code: 'K1' },
      { name: 'KIET+', code: 'KK' }
    ]);
    const k1 = campuses.find(c => c.code === 'K1')._id;
    const kk = campuses.find(c => c.code === 'KK')._id;

    console.log('Seeding Branches...');
    const branches = await Branch.insertMany([
      { name: 'Artificial Intelligence and Machine Learning', code: 'CSM' },
      { name: 'Artificial Intelligence', code: 'CAI' },
      { name: 'Data Science', code: 'CSD' },
      { name: 'Artificial Intelligence and Data Science', code: 'AI&DS' },
      { name: 'Cyber Security', code: 'CSC' }
    ]);

    console.log('Seeding CampusBranchAvailability...');
    const availabilities = [];
    branches.forEach(b => {
      // KIET and KIET+ have all branches
      availabilities.push({ campusId: k1, branchId: b._id, isAvailable: true });
      availabilities.push({ campusId: kk, branchId: b._id, isAvailable: true });
    });
    await CampusBranchAvailability.insertMany(availabilities);

    console.log('Seeding Academic Year and Semesters...');
    const ay = await AcademicYear.create({
      academicYear: '2023-2024',
      startDate: new Date('2023-08-01'),
      endDate: new Date('2024-05-30')
    });

    const semesters = [];
    for (let year = 1; year <= 4; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        semesters.push({
          academicYearId: ay._id,
          semesterCode: `${year}-${sem}`,
          year
        });
      }
    }
    const insertedSemesters = await Semester.insertMany(semesters);

    console.log('Seeding Sample Subjects...');
    await Subject.create({
      subjectCode: 'CS101',
      subjectName: 'Introduction to AI',
      semesterId: insertedSemesters[0]._id
    });

    console.log('Seeding Admin User...');
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    await User.create({
      username: adminUsername,
      passwordHash,
      role: 'ADMIN',
      scopeRef: { type: null, refId: null }
    });

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed!', error);
    process.exit(1);
  }
};

seedData();
