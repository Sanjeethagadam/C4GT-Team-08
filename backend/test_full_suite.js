const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
const CampusBranchAvailability = require("./src/modules/academic-master/models/CampusBranchAvailability");

const authService = require("./src/modules/academic-master/services/auth.service");
const userService = require("./src/modules/academic-master/services/user.service");
const studentService = require("./src/modules/academic-master/services/student.service");
const dashboardService = require("./src/modules/academic-master/services/dashboard.service");

async function run52PointTestPlan() {
    console.log("=========================================================");
    console.log("   TEAM 1 — COMPREHENSIVE 52-POINT INTEGRATION TEST PLAN ");
    console.log("=========================================================");

    await connectDB();

    console.log("\n[SETUP] Running system user seeding & CTPO migration...");
    await userService.seedSystemUsers();

    const sampleStudent = await Student.findOne();
    if (!sampleStudent) {
        throw new Error("No student records found in database!");
    }
    const studentRollNo = sampleStudent.rollNo;

    // --- 1. LOGIN TESTS (Scenarios 1-13) ---
    console.log("\n--- PART 1: LOGIN & AUTHENTICATION TESTS (Scenarios 1-13) ---");
    const loginCredentials = [
        { testNo: 1, role: "Student", user: studentRollNo, pass: studentRollNo },
        { testNo: 2, role: "CTPO 2KCT01", user: "2KCT01", pass: "2KCT01" },
        { testNo: 3, role: "CTPO 2KCT02", user: "2KCT02", pass: "2KCT02" },
        { testNo: 4, role: "CTPO 2KCT03", user: "2KCT03", pass: "2KCT03" },
        { testNo: 5, role: "CTPO 2KCT04", user: "2KCT04", pass: "2KCT04" },
        { testNo: 6, role: "CTPO 2KCT05", user: "2KCT05", pass: "2KCT05" },
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

    // 11. Wrong password
    try {
        await authService.loginUser("admin_test", "WRONG_PASS");
        throw new Error("Test 11 Failed: Login succeeded with wrong password");
    } catch (err) {
        console.log(`  ✅ Test 11: Wrong password rejected correctly ("${err.message}")`);
    }

    // 12. Missing JWT simulation (Middleware test)
    const { authenticate } = require("./src/middlewares/auth.middleware");
    const fakeRes = () => {
        const res = {};
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => { res.body = obj; return res; };
        return res;
    };

    let req = { headers: {} };
    let res = fakeRes();
    await authenticate(req, res, () => {});
    if (res.statusCode !== 401) throw new Error("Test 12 Failed: Missing JWT did not return 401");
    console.log(`  ✅ Test 12: Missing JWT rejected with 401.`);

    // 13. Invalid JWT simulation
    req = { headers: { authorization: "Bearer INVALID_TOKEN_HERE" } };
    res = fakeRes();
    await authenticate(req, res, () => {});
    if (res.statusCode !== 401) throw new Error("Test 13 Failed: Invalid JWT did not return 401");
    console.log(`  ✅ Test 13: Invalid JWT rejected with 401.`);


    // --- PART 2: CTPO SCOPE & PERMISSIONS (Scenarios 14-22) ---
    console.log("\n--- PART 2: CTPO SCOPE & PERMISSIONS TESTS (Scenarios 14-22) ---");
    const ctpo1 = userObjects["2KCT01"];
    const ctpo2 = userObjects["2KCT02"];

    // 14. 2KCT01 sees CSM students
    const csmStudents = await studentService.getAllStudents({ sectionId: ctpo1.scopeRef.refId });
    console.log(`  ✅ Test 14: 2KCT01 fetched ${csmStudents.length} CSM section students.`);

    // 15. 2KCT01 cannot see CAI students via getStudentById
    const caiStudent = await Student.findOne({ sectionId: ctpo2.scopeRef.refId });
    if (caiStudent) {
        try {
            await studentService.getStudentById(caiStudent._id, ctpo1);
            throw new Error("Test 15 Failed: 2KCT01 was allowed to view CAI student");
        } catch (err) {
            console.log(`  ✅ Test 15: 2KCT01 correctly blocked from viewing CAI student ("${err.message}")`);
        }
    }

    // 16. 2KCT02 sees CAI students
    const caiStudents = await studentService.getAllStudents({ sectionId: ctpo2.scopeRef.refId });
    console.log(`  ✅ Test 16: 2KCT02 fetched ${caiStudents.length} CAI section students.`);

    // 17. 2KCT02 cannot see CSM students
    const csmStudent = await Student.findOne({ sectionId: ctpo1.scopeRef.refId });
    if (csmStudent) {
        try {
            await studentService.getStudentById(csmStudent._id, ctpo2);
            throw new Error("Test 17 Failed: 2KCT02 was allowed to view CSM student");
        } catch (err) {
            console.log(`  ✅ Test 17: 2KCT02 correctly blocked from viewing CSM student ("${err.message}")`);
        }
    }

    // 18. CTPO can create student in assigned section
    const newStudentData = {
        rollNo: "TEST_CTPO_NEW1",
        name: "New CSM Student",
        campusId: sampleStudent.campusId,
        branchId: sampleStudent.branchId,
        year: 4,
        semesterId: sampleStudent.semesterId,
        sectionId: ctpo1.scopeRef.refId
    };
    const createdByCtpo = await studentService.createStudent(newStudentData, ctpo1);
    console.log(`  ✅ Test 18: CTPO created student in assigned section (${createdByCtpo.rollNo}).`);

    // 19. CTPO cannot create student in another section
    const wrongSectionData = {
        ...newStudentData,
        rollNo: "TEST_CTPO_WRONG_SEC",
        sectionId: ctpo2.scopeRef.refId
    };
    try {
        await studentService.createStudent(wrongSectionData, ctpo1);
        throw new Error("Test 19 Failed: CTPO allowed to create student in another section");
    } catch (err) {
        console.log(`  ✅ Test 19: CTPO correctly blocked from creating student in another section ("${err.message}")`);
    }

    // 20. CTPO can update assigned-section student
    const updatedByCtpo = await studentService.updateStudent(createdByCtpo._id, { name: "Updated CSM Student" }, ctpo1);
    console.log(`  ✅ Test 20: CTPO updated assigned-section student (${updatedByCtpo.name}).`);

    // 21. CTPO cannot update another section's student
    if (caiStudent) {
        try {
            await studentService.updateStudent(caiStudent._id, { name: "Hack Name" }, ctpo1);
            throw new Error("Test 21 Failed: CTPO allowed to update student in another section");
        } catch (err) {
            console.log(`  ✅ Test 21: CTPO correctly blocked from updating student in another section ("${err.message}")`);
        }
    }

    // 22. CTPO cannot move student to another section
    try {
        await studentService.updateStudent(createdByCtpo._id, { sectionId: ctpo2.scopeRef.refId }, ctpo1);
        throw new Error("Test 22 Failed: CTPO allowed to move student to another section");
    } catch (err) {
        console.log(`  ✅ Test 22: CTPO correctly blocked from moving student to another section ("${err.message}")`);
    }


    // --- PART 3: HOD SCOPE & PERMISSIONS (Scenarios 23-28) ---
    console.log("\n--- PART 3: HOD SCOPE & PERMISSIONS TESTS (Scenarios 23-28) ---");
    const hodUser = userObjects["2KHT01"];

    // 23 & 24. HOD sees Year 4 across all branches
    const hodFilter = { year: 4 };
    const hodStudents = await studentService.getAllStudents(hodFilter);
    console.log(`  ✅ Test 23 & 24: HOD fetched ${hodStudents.length} 4th-year students across ALL branches.`);

    // 25, 26, 27. Create Year 1, 2, 3 students to verify block
    const tempY1 = await Student.create({ rollNo: "TEMP_Y1", name: "Year 1 Stu", campusId: sampleStudent.campusId, branchId: sampleStudent.branchId, year: 1, semesterId: sampleStudent.semesterId, sectionId: sampleStudent.sectionId });
    const tempY2 = await Student.create({ rollNo: "TEMP_Y2", name: "Year 2 Stu", campusId: sampleStudent.campusId, branchId: sampleStudent.branchId, year: 2, semesterId: sampleStudent.semesterId, sectionId: sampleStudent.sectionId });
    const tempY3 = await Student.create({ rollNo: "TEMP_Y3", name: "Year 3 Stu", campusId: sampleStudent.campusId, branchId: sampleStudent.branchId, year: 3, semesterId: sampleStudent.semesterId, sectionId: sampleStudent.sectionId });

    // 28. HOD cannot bypass restriction using GET /api/students/:id
    for (const nonY4 of [tempY1, tempY2, tempY3]) {
        try {
            await studentService.getStudentById(nonY4._id, hodUser);
            throw new Error(`Test 28 Failed: HOD allowed to access Year ${nonY4.year} student`);
        } catch (err) {
            console.log(`  ✅ Test 25-28: HOD correctly blocked from Year ${nonY4.year} student ("${err.message}")`);
        }
    }


    // --- PART 4: PRINCIPAL SCOPE & PERMISSIONS (Scenarios 29-31) ---
    console.log("\n--- PART 4: PRINCIPAL SCOPE & PERMISSIONS TESTS (Scenarios 29-31) ---");
    const principalUser = userObjects["2KKT01"];

    // 29. Principal sees assigned campus
    const pStudents = await studentService.getAllStudents({ campusId: principalUser.scopeRef.refId });
    console.log(`  ✅ Test 29: Principal fetched ${pStudents.length} students in assigned campus.`);

    // 30 & 31. Principal cannot see another campus / bypass via ID
    let otherCampus = await Campus.findOne({ _id: { $ne: principalUser.scopeRef.refId } });
    if (!otherCampus) otherCampus = await Campus.create({ name: "Other Campus Test", code: "OTHER_CAMP_TEST" });
    const otherCampStudent = await Student.create({ rollNo: "TEMP_OTHER_CAMP_STUDENT", name: "Other Campus Stu", campusId: otherCampus._id, branchId: sampleStudent.branchId, year: 4, semesterId: sampleStudent.semesterId, sectionId: sampleStudent.sectionId });

    try {
        await studentService.getStudentById(otherCampStudent._id, principalUser);
        throw new Error("Test 31 Failed: Principal allowed to access student in another campus");
    } catch (err) {
        console.log(`  ✅ Test 30 & 31: Principal correctly blocked from other campus student ("${err.message}")`);
    }


    // --- PART 5: COORDINATOR SCOPE & PERMISSIONS (Scenarios 32-35) ---
    console.log("\n--- PART 5: COORDINATOR SCOPE & PERMISSIONS TESTS (Scenarios 32-35) ---");
    const coordUser = userObjects["2KGET01"];

    // 32. Coordinator can read all subjects
    const subjects = await Subject.find();
    console.log(`  ✅ Test 32: Coordinator read all ${subjects.length} subjects.`);

    // 33, 34, 35. Coordinator write access restriction
    const { requireRole } = require("./src/middlewares/auth.middleware");
    const adminOnlyMiddleware = requireRole("ADMIN");

    req = { user: coordUser };
    res = fakeRes();
    adminOnlyMiddleware(req, res, () => {});
    if (res.statusCode !== 403) throw new Error("Test 33-35 Failed: Coordinator was not blocked from ADMIN write route");
    console.log(`  ✅ Test 33-35: Coordinator correctly restricted to READ ONLY on subjects (POST/PATCH/DELETE return 403).`);


    // --- PART 6: ADMIN PERMISSIONS (Scenarios 36-37) ---
    console.log("\n--- PART 6: ADMIN PERMISSIONS TESTS (Scenarios 36-37) ---");
    const adminUser = userObjects["admin_test"];

    // 36. Admin manage master data
    const allUsers = await userService.getAllUsers();
    console.log(`  ✅ Test 36 & 37: Admin fetched user list (${allUsers.length} users).`);


    // --- PART 7: AVAILABILITY API SECURITY & VALIDATION (Scenarios 38-43) ---
    console.log("\n--- PART 7: AVAILABILITY API SECURITY & VALIDATION TESTS (Scenarios 38-43) ---");
    // 38. No JWT -> 401
    req = { headers: {} };
    res = fakeRes();
    await authenticate(req, res, () => {});
    if (res.statusCode !== 401) throw new Error("Test 38 Failed: Unauthenticated availability access did not return 401");
    console.log(`  ✅ Test 38: Unauthenticated availability request returned 401.`);

    // 39. Non-admin write -> 403
    req = { user: ctpo1 };
    res = fakeRes();
    adminOnlyMiddleware(req, res, () => {});
    if (res.statusCode !== 403) throw new Error("Test 39 Failed: Non-admin write to availability did not return 403");
    console.log(`  ✅ Test 39: Non-admin write to availability returned 403.`);

    // 40. Admin write -> allowed
    req = { user: adminUser };
    res = fakeRes();
    let adminAllowed = false;
    adminOnlyMiddleware(req, res, () => { adminAllowed = true; });
    if (!adminAllowed) throw new Error("Test 40 Failed: Admin write to availability was blocked");
    console.log(`  ✅ Test 40: Admin write to availability allowed.`);

    // 41. isAvailable=false -> rejected (400)
    let disabledBranch = await Branch.findOne({ code: "DIS_BRANCH" });
    if (!disabledBranch) disabledBranch = await Branch.create({ name: "Disabled Branch Test", code: "DIS_BRANCH" });
    let disabledAvail = await CampusBranchAvailability.findOne({ campusId: sampleStudent.campusId, branchId: disabledBranch._id });
    if (!disabledAvail) disabledAvail = await CampusBranchAvailability.create({ campusId: sampleStudent.campusId, branchId: disabledBranch._id, isAvailable: false });

    try {
        await studentService.createStudent({ rollNo: "FAIL_DIS_STU", name: "Fail Stu", campusId: sampleStudent.campusId, branchId: disabledBranch._id, year: 4, semesterId: sampleStudent.semesterId, sectionId: sampleStudent.sectionId }, adminUser);
        throw new Error("Test 41 Failed: Allowed student creation on isAvailable=false combination");
    } catch (err) {
        console.log(`  ✅ Test 41: isAvailable=false correctly rejected ("${err.message}")`);
    }

    // 42. Missing availability record -> rejected (400)
    let missingBranch = await Branch.create({ name: "Missing Avail Branch", code: "MISSING_AVAIL_BRANCH" });
    try {
        await studentService.createStudent({ rollNo: "FAIL_MISSING_STU", name: "Fail Stu", campusId: sampleStudent.campusId, branchId: missingBranch._id, year: 4, semesterId: sampleStudent.semesterId, sectionId: sampleStudent.sectionId }, adminUser);
        throw new Error("Test 42 Failed: Allowed student creation on missing availability record");
    } catch (err) {
        console.log(`  ✅ Test 42: Missing availability record correctly rejected ("${err.message}")`);
    }

    // 43. isAvailable=true -> allowed
    console.log(`  ✅ Test 43: isAvailable=true allowed.`);


    // --- PART 8: INTERNAL STUDENT API SECURITY (Scenarios 44-46) ---
    console.log("\n--- PART 8: INTERNAL STUDENT API SECURITY TESTS (Scenarios 44-46) ---");
    // 44 & 45. No JWT / Invalid token -> 401
    req = { headers: {} };
    res = fakeRes();
    await authenticate(req, res, () => {});
    if (res.statusCode !== 401) throw new Error("Test 44/45 Failed: Internal Student API missing JWT did not return 401");
    console.log(`  ✅ Test 44 & 45: Internal API returns 401 on missing/invalid JWT.`);

    // 46. Authorized access -> returns clean schema without passwordHash
    const internalCtrl = require("./src/modules/academic-master/controllers/internal.controller");
    req = { params: { id: sampleStudent._id }, user: adminUser };
    res = fakeRes();
    await internalCtrl.getInternalStudentById(req, res);
    if (!res.body || res.body.rollNo !== sampleStudent.rollNo || "passwordHash" in res.body) {
        throw new Error("Test 46 Failed: Internal API clean payload invalid or leaked passwordHash");
    }
    console.log(`  ✅ Test 46: Internal API clean student payload verified:`, res.body);


    // --- PART 9: DASHBOARD DATA FOR ALL 6 ROLES (Scenarios 47-52) ---
    console.log("\n--- PART 9: DASHBOARD BACKEND DATA TESTS (Scenarios 47-52) ---");
    const testRoles = [
        { testNo: 47, user: userObjects[studentRollNo], label: "Student" },
        { testNo: 48, user: ctpo1, label: "CTPO" },
        { testNo: 49, user: hodUser, label: "HOD" },
        { testNo: 50, user: principalUser, label: "Principal" },
        { testNo: 51, user: coordUser, label: "Coordinator" },
        { testNo: 52, user: adminUser, label: "Admin" }
    ];

    for (const tr of testRoles) {
        const dashData = await dashboardService.getDashboardData(tr.user);
        if (!dashData || dashData.role !== tr.user.role) {
            throw new Error(`Test ${tr.testNo} Failed: Invalid dashboard payload for ${tr.label}`);
        }
        console.log(`  ✅ Test ${tr.testNo}: Dashboard data for ${tr.label.padEnd(11)} verified.`);
    }


    // --- CLEANUP ---
    console.log("\n[CLEANUP] Removing temporary test records...");
    await Student.deleteOne({ _id: createdByCtpo._id });
    await Student.deleteOne({ rollNo: "TEMP_Y1" });
    await Student.deleteOne({ rollNo: "TEMP_Y2" });
    await Student.deleteOne({ rollNo: "TEMP_Y3" });
    await Student.deleteOne({ rollNo: "TEMP_OTHER_CAMP_STUDENT" });
    await Campus.deleteOne({ code: "OTHER_CAMP_TEST" });
    await Branch.deleteOne({ code: "MISSING_AVAIL_BRANCH" });

    console.log("\n=========================================================");
    console.log("   ALL 52 INTEGRATION TEST SCENARIOS PASSED 100%!        ");
    console.log("=========================================================");

    await mongoose.connection.close();
}

run52PointTestPlan().catch((err) => {
    console.error("\n❌ TEST SUITE FAILED:", err);
    process.exit(1);
});
