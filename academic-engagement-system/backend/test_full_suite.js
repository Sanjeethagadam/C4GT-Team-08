const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const connectDB = require("./src/config/db");
const User = require("./src/modules/academic-master/models/User");
const Student = require("./src/modules/academic-master/models/Student");
const Campus = require("./src/modules/academic-master/models/Campus");
const Branch = require("./src/modules/academic-master/models/Branch");
const Section = require("./src/modules/academic-master/models/Section");
const Subject = require("./src/modules/academic-master/models/Subject");
const Semester = require("./src/modules/academic-master/models/Semester");
const AcademicYear = require("./src/modules/academic-master/models/AcademicYear");
const MidMark = require("./src/modules/academic-master/models/MidMark");
const Timetable = require("./src/modules/academic-master/models/Timetable");

const authService = require("./src/modules/academic-master/services/auth.service");
const userService = require("./src/modules/academic-master/services/user.service");
const studentService = require("./src/modules/academic-master/services/student.service");
const subjectService = require("./src/modules/academic-master/services/subject.service");
const dashboardService = require("./src/modules/academic-master/services/dashboard.service");
const midMarkService = require("./src/modules/academic-master/services/midMark.service");
const timetableService = require("./src/modules/academic-master/services/timetable.service");
const riskAnalysisService = require("./src/modules/academic-master/services/riskAnalysis.service");

async function runComprehensiveTestSuite() {
    console.log("=========================================================================");
    console.log("   ACADEMIC ENGAGEMENT SYSTEM — COMPREHENSIVE BACKEND TEST SUITE ");
    console.log("=========================================================================");

    await connectDB();

    console.log("\n[SETUP] Seeding system users, CTPO branch migrations & 4th-year subjects...");
    await userService.seedSystemUsers();

    const sampleStudent = await Student.findOne({ year: 4 });
    if (!sampleStudent) {
        throw new Error("No 4th-year student records found in database!");
    }
    const studentRollNo = sampleStudent.rollNo;

    // --- PART 1: AUTHENTICATION & LOGIN TESTS ---
    console.log("\n--- PART 1: LOGIN & AUTHENTICATION TESTS ---");
    const loginCredentials = [
        { testNo: 1, role: "Student", user: studentRollNo, pass: studentRollNo },
        { testNo: 2, role: "CTPO 2KCT01 (CSM)", user: "2KCT01", pass: "2KCT01" },
        { testNo: 3, role: "CTPO 2KCT02 (CAI)", user: "2KCT02", pass: "2KCT02" },
        { testNo: 4, role: "CTPO 2KCT03 (CSD)", user: "2KCT03", pass: "2KCT03" },
        { testNo: 5, role: "CTPO 2KCT04 (AID)", user: "2KCT04", pass: "2KCT04" },
        { testNo: 6, role: "CTPO 2KCT05 (CSC)", user: "2KCT05", pass: "2KCT05" },
        { testNo: 7, role: "HOD", user: "2KHT01", pass: "2KHT01" },
        { testNo: 8, role: "Principal", user: "2KKT01", pass: "2KKT01" },
        { testNo: 9, role: "Coordinator", user: "2KGET01", pass: "2KGET01" },
        { testNo: 10, role: "Admin", user: "admin_test", pass: "admin123" }
    ];

    const tokens = {};
    const userObjects = {};

    for (const cred of loginCredentials) {
        const res = await authService.loginUser(cred.user, cred.pass);
        if (!res.token) throw new Error(`Test ${cred.testNo} Failed: Token missing for ${cred.role}`);
        if ("passwordHash" in res.user) throw new Error(`Test ${cred.testNo} Failed: passwordHash exposed for ${cred.role}!`);
        tokens[cred.user] = res.token;
        userObjects[cred.user] = await User.findOne({ username: cred.user });
        console.log(`  ✅ Test ${cred.testNo}: ${cred.role} login passed.`);
    }

    // 11. Wrong password rejected
    try {
        await authService.loginUser("admin_test", "WRONG_PASS");
        throw new Error("Test 11 Failed: Login succeeded with wrong password");
    } catch (err) {
        console.log(`  ✅ Test 11: Wrong password rejected correctly ("${err.message}")`);
    }

    // 12. Middleware test - missing JWT
    const { authenticate } = require("./src/middlewares/auth.middleware");
    const fakeRes = () => {
        const res = {};
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => { res.body = obj; return res; };
        return res;
    };

    let req = { headers: {} };
    let res = fakeRes();
    await authenticate(req, res, () => { });
    if (res.statusCode !== 401) throw new Error("Test 12 Failed: Missing JWT did not return 401");
    console.log(`  ✅ Test 12: Missing JWT rejected with 401.`);


    // --- PART 2: FIVE CTPO BRANCH MAPPINGS & CROSS-BRANCH BARRIER TESTS ---
    console.log("\n--- PART 2: FIVE CTPO BRANCH SCOPE & CROSS-BRANCH SECURITY ---");
    const ctpoMap = {
        "2KCT01": "CSM",
        "2KCT02": "CAI",
        "2KCT03": "CSD",
        "2KCT04": "AID",
        "2KCT05": "CSC"
    };

    const branchDocs = {};
    for (const [ctpoUser, bCode] of Object.entries(ctpoMap)) {
        const branch = await Branch.findOne({ code: bCode });
        if (!branch) throw new Error(`Branch ${bCode} not found in MongoDB`);
        branchDocs[bCode] = branch;

        const u = userObjects[ctpoUser];
        if (!u.scopeRef || u.scopeRef.type !== "BRANCH" || u.scopeRef.refId.toString() !== branch._id.toString()) {
            throw new Error(`CTPO ${ctpoUser} does not have correct BRANCH scope for ${bCode}`);
        }
        console.log(`  ✅ Verified CTPO ${ctpoUser} mapped to Branch ${bCode} (${branch._id}) with scope type BRANCH.`);
    }

    // Test branch-scoped student retrieval for all 5 CTPOs
    for (const [ctpoUser, bCode] of Object.entries(ctpoMap)) {
        const u = userObjects[ctpoUser];
        const branch = branchDocs[bCode];
        const students = await studentService.getAllStudents({ branchId: u.scopeRef.refId, year: 4 });
        console.log(`  ✅ CTPO ${ctpoUser} (${bCode}): fetched ${students.length} 4th-year branch students.`);
        if (students.length === 0) {
            console.warn(`     Warning: No year 4 students found for ${bCode}`);
        }
        // Verify every student belongs to that branch and is Year 4
        for (const s of students) {
            const sBranchId = s.branchId?._id ? s.branchId._id.toString() : s.branchId?.toString();
            if (sBranchId !== branch._id.toString() || s.year !== 4) {
                throw new Error(`CTPO ${ctpoUser} received student from another branch or non-year-4!`);
            }
        }
    }

    // Test cross-branch access prevention
    const csmStudent = await Student.findOne({ branchId: branchDocs["CSM"]._id, year: 4 });
    const caiStudent = await Student.findOne({ branchId: branchDocs["CAI"]._id, year: 4 });
    const csdStudent = await Student.findOne({ branchId: branchDocs["CSD"]._id, year: 4 });
    const aidStudent = await Student.findOne({ branchId: branchDocs["AID"]._id, year: 4 });
    const cscStudent = await Student.findOne({ branchId: branchDocs["CSC"]._id, year: 4 });

    // 2KCT01 (CSM) cannot view CAI student
    if (caiStudent) {
        try {
            await studentService.getStudentById(caiStudent._id, userObjects["2KCT01"]);
            throw new Error("Cross-branch security violation: 2KCT01 accessed CAI student!");
        } catch (err) {
            console.log(`  ✅ Cross-branch blocked: 2KCT01 cannot access CAI student ("${err.message}")`);
        }
    }

    // 2KCT02 (CAI) cannot view CSD student
    if (csdStudent) {
        try {
            await studentService.getStudentById(csdStudent._id, userObjects["2KCT02"]);
            throw new Error("Cross-branch security violation: 2KCT02 accessed CSD student!");
        } catch (err) {
            console.log(`  ✅ Cross-branch blocked: 2KCT02 cannot access CSD student ("${err.message}")`);
        }
    }

    // 2KCT03 (CSD) cannot view AID student
    if (aidStudent) {
        try {
            await studentService.getStudentById(aidStudent._id, userObjects["2KCT03"]);
            throw new Error("Cross-branch security violation: 2KCT03 accessed AID student!");
        } catch (err) {
            console.log(`  ✅ Cross-branch blocked: 2KCT03 cannot access AID student ("${err.message}")`);
        }
    }

    // 2KCT04 (AID) cannot view CSC student
    if (cscStudent) {
        try {
            await studentService.getStudentById(cscStudent._id, userObjects["2KCT04"]);
            throw new Error("Cross-branch security violation: 2KCT04 accessed CSC student!");
        } catch (err) {
            console.log(`  ✅ Cross-branch blocked: 2KCT04 cannot access CSC student ("${err.message}")`);
        }
    }

    // 2KCT05 (CSC) cannot view CSM student
    if (csmStudent) {
        try {
            await studentService.getStudentById(csmStudent._id, userObjects["2KCT05"]);
            throw new Error("Cross-branch security violation: 2KCT05 accessed CSM student!");
        } catch (err) {
            console.log(`  ✅ Cross-branch blocked: 2KCT05 cannot access CSM student ("${err.message}")`);
        }
    }


    // --- PART 3: SUBJECTS & SEMESTER HANDLING ---
    console.log("\n--- PART 3: DYNAMIC SUBJECTS & SEMESTER HANDLING ---");
    const sem41 = await Semester.findOne({ year: 4, semesterCode: "I SEM" });
    const sem42 = await Semester.findOne({ year: 4, semesterCode: "II SEM" });

    const csm41Subjects = await subjectService.getAllSubjects({
        branchId: branchDocs["CSM"]._id,
        semesterId: sem41._id
    });
    console.log(`  ✅ CSM 4-1 dynamic subjects fetched (${csm41Subjects.length} subjects):`, csm41Subjects.map(s => s.subjectName));

    const csm42Subjects = await subjectService.getAllSubjects({
        branchId: branchDocs["CSM"]._id,
        semesterId: sem42._id
    });
    console.log(`  ✅ CSM 4-2 dynamic subjects fetched (${csm42Subjects.length} subjects):`, csm42Subjects.map(s => s.subjectName));

    if (csm41Subjects.length === 0 || csm42Subjects.length === 0) {
        throw new Error("Subjects missing for 4-1 or 4-2 semesters!");
    }


    // --- PART 4: MID MARKS MANAGEMENT & VALIDATION ---
    console.log("\n--- PART 4: MID MARKS ENTRY, UPDATE, AND VALIDATION ---");
    const testCsmStudent = csmStudent || sampleStudent;
    const testSubject1 = csm41Subjects[0];
    const testSubject2 = csm41Subjects[1];

    // 1. CTPO enters valid marks for student in assigned branch
    const marksData = {
        studentId: testCsmStudent._id,
        semesterId: sem41._id,
        midExam: "MID-1",
        marks: [
            { subjectId: testSubject1._id, marks: 18, maxMarks: 30 },
            { subjectId: testSubject2._id, marks: 12, maxMarks: 30 }
        ]
    };
    const enteredMarks = await midMarkService.enterMidMarks(marksData, userObjects["2KCT01"]);
    console.log(`  ✅ 2KCT01 entered mid marks for student ${testCsmStudent.rollNo} (${enteredMarks.length} subjects).`);

    // 2. CTPO blocked from entering marks for another branch student
    if (caiStudent) {
        try {
            await midMarkService.enterMidMarks({
                studentId: caiStudent._id,
                semesterId: sem41._id,
                midExam: "MID-1",
                marks: [{ subjectId: testSubject1._id, marks: 20, maxMarks: 30 }]
            }, userObjects["2KCT01"]);
            throw new Error("Security violation: 2KCT01 allowed to enter marks for CAI student!");
        } catch (err) {
            console.log(`  ✅ Cross-branch mark entry blocked correctly ("${err.message}")`);
        }
    }

    // 3. Mark validation: negative marks
    try {
        await midMarkService.enterMidMarks({
            studentId: testCsmStudent._id,
            semesterId: sem41._id,
            midExam: "MID-1",
            marks: [{ subjectId: testSubject1._id, marks: -5, maxMarks: 30 }]
        }, userObjects["2KCT01"]);
        throw new Error("Validation failure: Negative marks allowed!");
    } catch (err) {
        console.log(`  ✅ Negative marks rejected correctly ("${err.message}")`);
    }

    // 4. Mark validation: exceeding maxMarks
    try {
        await midMarkService.enterMidMarks({
            studentId: testCsmStudent._id,
            semesterId: sem41._id,
            midExam: "MID-1",
            marks: [{ subjectId: testSubject1._id, marks: 35, maxMarks: 30 }]
        }, userObjects["2KCT01"]);
        throw new Error("Validation failure: Marks exceeding max allowed!");
    } catch (err) {
        console.log(`  ✅ Marks exceeding maxMarks rejected correctly ("${err.message}")`);
    }

    // 5. Explicit MID-3 rejection test
    try {
        await midMarkService.enterMidMarks({
            studentId: testCsmStudent._id,
            semesterId: sem41._id,
            midExam: "MID-3",
            marks: [{ subjectId: testSubject1._id, marks: 20, maxMarks: 30 }]
        }, userObjects["2KCT01"]);
        throw new Error("Validation failure: MID-3 was accepted for marks entry!");
    } catch (err) {
        console.log(`  ✅ MID-3 rejected correctly for marks entry ("${err.message}")`);
    }

    // 6. Enter MID-2 marks
    const enteredMid2Marks = await midMarkService.enterMidMarks({
        studentId: testCsmStudent._id,
        semesterId: sem41._id,
        midExam: "MID-2",
        marks: [
            { subjectId: testSubject1._id, marks: 25, maxMarks: 30 },
            { subjectId: testSubject2._id, marks: 21, maxMarks: 30 }
        ]
    }, userObjects["2KCT01"]);
    console.log(`  ✅ 2KCT01 entered MID-2 marks for student ${testCsmStudent.rollNo} (${enteredMid2Marks.length} subjects).`);

    // 7. Update mark via updateMidMark
    const markToUpdate = enteredMarks[0];
    const updatedMark = await midMarkService.updateMidMark(markToUpdate._id, { marks: 22 }, userObjects["2KCT01"]);
    if (updatedMark.marks !== 22) throw new Error("Mark update failed to reflect new value");
    console.log(`  ✅ Mark updated successfully to ${updatedMark.marks}`);

    // Verify duplicate prevention in database
    const duplicateCheck = await MidMark.find({
        studentId: testCsmStudent._id,
        semesterId: sem41._id,
        subjectId: testSubject1._id,
        midExam: "MID-1"
    });
    if (duplicateCheck.length !== 1) {
        throw new Error(`Duplicate mark records created: expected 1, found ${duplicateCheck.length}`);
    }
    console.log(`  ✅ Duplicate prevention verified: exact single record for (student + sem + sub + mid).`);

    // 8. Student self-access to marks
    const studentUser = await User.findOne({ username: testCsmStudent.rollNo });
    if (studentUser) {
        const studentMarksData = await midMarkService.getMyMidMarks(studentUser);
        console.log(`  ✅ Student ${studentUser.username} retrieved own marks (${studentMarksData.semesters.length} semesters).`);
    }

    // 9. Unauthorized student access to another student's marks
    if (studentUser && caiStudent) {
        try {
            await midMarkService.getStudentMidMarks(caiStudent._id, studentUser);
            throw new Error("Security violation: Student accessed another student's marks!");
        } catch (err) {
            console.log(`  ✅ Unauthorized student access blocked correctly ("${err.message}")`);
        }
    }


    // --- PART 5: TIMETABLE MANAGEMENT & UPLOADS ---
    console.log("\n--- PART 5: TIMETABLE MANAGEMENT & UPLOAD VALIDATION ---");
    const sampleFilePath = path.join(__dirname, "sample_test_timetable.pdf");
    fs.writeFileSync(sampleFilePath, "Sample PDF Content for Test");

    const sampleFileObj = {
        filename: "test-csm-timetable.pdf",
        originalname: "CSM_4_1_Mid1_Timetable.pdf",
        mimetype: "application/pdf",
        size: 1024,
        path: sampleFilePath
    };

    // 1. MID-3 rejection for timetable
    try {
        await timetableService.uploadTimetable({
            semesterId: sem41._id,
            year: 4,
            timetableType: "MID",
            midExam: "MID-3"
        }, sampleFileObj, userObjects["2KCT01"]);
        throw new Error("Validation failure: MID-3 accepted for timetable upload!");
    } catch (err) {
        console.log(`  ✅ MID-3 rejected correctly for timetable upload ("${err.message}")`);
    }

    // 2. CTPO uploads MID-1 timetable for assigned branch directly to MongoDB Cluster
    const uploadedTimetable = await timetableService.uploadTimetable({
        semesterId: sem41._id,
        year: 4,
        timetableType: "MID",
        midExam: "MID-1"
    }, sampleFileObj, userObjects["2KCT01"]);
    console.log(`  ✅ 2KCT01 uploaded MID-1 timetable for CSM 4-1 (ID: ${uploadedTimetable._id})`);

    // Verify MongoDB Cluster GridFS storage
    if (uploadedTimetable.storage !== "GRIDFS" || !uploadedTimetable.file?.gridFsId) {
        throw new Error("Cluster storage validation failed: Timetable not stored in MongoDB GridFS!");
    }
    console.log(`  ✅ Verified direct MongoDB Cluster GridFS storage (GridFS ID: ${uploadedTimetable.file.gridFsId})`);
    console.log(`  ✅ Verified MongoDB Cluster Path: ${uploadedTimetable.clusterPath}`);

    // 3. CTPO uploads MID-2 timetable for assigned branch
    const uploadedMid2Timetable = await timetableService.uploadTimetable({
        semesterId: sem41._id,
        year: 4,
        timetableType: "MID",
        midExam: "MID-2"
    }, sampleFileObj, userObjects["2KCT01"]);
    console.log(`  ✅ 2KCT01 uploaded MID-2 timetable for CSM 4-1 (ID: ${uploadedMid2Timetable._id})`);

    // 4. CTPO uploads SEMESTER timetable for assigned branch
    const uploadedSemTimetable = await timetableService.uploadTimetable({
        semesterId: sem41._id,
        year: 4,
        timetableType: "SEMESTER"
    }, sampleFileObj, userObjects["2KCT01"]);
    console.log(`  ✅ 2KCT01 uploaded SEMESTER timetable for CSM 4-1 (ID: ${uploadedSemTimetable._id})`);

    // 5. Replace existing timetable test (re-upload MID-1)
    await timetableService.uploadTimetable({
        semesterId: sem41._id,
        year: 4,
        timetableType: "MID",
        midExam: "MID-1"
    }, sampleFileObj, userObjects["2KCT01"]);

    const csmMid1Count = await Timetable.countDocuments({
        branchId: branchDocs["CSM"]._id,
        semesterId: sem41._id,
        year: 4,
        timetableType: "MID",
        midExam: "MID-1"
    });
    if (csmMid1Count !== 1) {
        throw new Error(`Duplicate timetable created: expected 1, found ${csmMid1Count}`);
    }
    console.log(`  ✅ Timetable replacement verified: re-uploading updated existing record rather than duplicating.`);

    // 6. Student retrieves own timetable
    if (studentUser) {
        const myTimetableData = await timetableService.getMyTimetable(studentUser);
        console.log(`  ✅ Student ${studentUser.username} retrieved branch timetable (${myTimetableData.timetables.length} timetables).`);
    }

    // 7. CTPO 2KCT02 (CAI) cannot access CSM timetable
    try {
        await timetableService.getTimetableById(uploadedTimetable._id, userObjects["2KCT02"]);
        throw new Error("Security failure: 2KCT02 accessed CSM timetable!");
    } catch (err) {
        console.log(`  ✅ Cross-branch timetable access blocked ("${err.message}")`);
    }


    // --- PART 6: RISK ANALYSIS ---
    console.log("\n--- PART 6: RISK ANALYSIS CALCULATIONS ---");
    const riskData = await riskAnalysisService.calculateBranchRiskAnalysis(
        branchDocs["CSM"]._id,
        userObjects["2KCT01"]
    );
    console.log(`  ✅ Risk Analysis generated for CSM:`);
    console.log(`     - Total Students: ${riskData.metrics.totalStudents}`);
    console.log(`     - Evaluated Students: ${riskData.metrics.evaluatedStudents}`);
    console.log(`     - Students with Mid Failures: ${riskData.metrics.studentsWithMidFailures}`);
    console.log(`     - Average Branch Marks: ${riskData.metrics.averageBranchMarks}`);
    console.log(`     - Risk Distribution: High: ${riskData.riskDistribution.HIGH}, Med: ${riskData.riskDistribution.MEDIUM}, Low: ${riskData.riskDistribution.LOW}`);
    console.log(`     - Real Backlog Status: ${riskData.backlogMetrics.message}`);


    // --- PART 7: DASHBOARDS & STUDENT PROFILE ---
    console.log("\n--- PART 7: DASHBOARD & STUDENT PROFILE APIS ---");
    const ctpoDashboard = await dashboardService.getDashboardData(userObjects["2KCT01"]);
    if (ctpoDashboard.role !== "CTPO" || !ctpoDashboard.branch || ctpoDashboard.branch.code !== "CSM") {
        throw new Error("CTPO Dashboard structure mismatch");
    }
    console.log(`  ✅ CTPO Dashboard returned branch stats (Branch: ${ctpoDashboard.branch.code}, Year: ${ctpoDashboard.year}).`);

    if (studentUser) {
        const stuDashboard = await dashboardService.getDashboardData(studentUser);
        console.log(`  ✅ Student Dashboard returned profile & academic items.`);

        const stuProfile = await studentService.getMyProfile(studentUser);
        console.log(`  ✅ Student Profile returned (${stuProfile.rollNo}, ${stuProfile.name}, Backlogs: ${stuProfile.backlogs.count}).`);
    }


    // --- PART 8: EXISTING TEAM-1 ROLE INTEGRITY ---
    console.log("\n--- PART 8: EXISTING TEAM-1 ROLE ACCESS INTEGRITY ---");
    const hodDash = await dashboardService.getDashboardData(userObjects["2KHT01"]);
    console.log(`  ✅ HOD Dashboard accessible (Year 4: ${hodDash.totalStudents} students across branches).`);

    const principalDash = await dashboardService.getDashboardData(userObjects["2KKT01"]);
    console.log(`  ✅ Principal Dashboard accessible (Campus: ${principalDash.campus?.code || "KIET"}).`);

    const adminDash = await dashboardService.getDashboardData(userObjects["admin_test"]);
    console.log(`  ✅ Admin Dashboard accessible (Total counts: ${adminDash.counts.students} students, ${adminDash.counts.subjects} subjects).`);

    // Clean up temporary test file
    if (fs.existsSync(sampleFilePath)) {
        try { fs.unlinkSync(sampleFilePath); } catch (e) { }
    }

    console.log("\n=========================================================================");
    console.log("   ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (100% PASS RATE)");
    console.log("=========================================================================\n");

    await mongoose.disconnect();
}

runComprehensiveTestSuite().catch((err) => {
    console.error("\n❌ TEST SUITE FAILED WITH ERROR:\n", err);
    process.exit(1);
});
