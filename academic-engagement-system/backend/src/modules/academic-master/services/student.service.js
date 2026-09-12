const Student = require("../models/Student");
const Campus = require("../models/Campus");
const Branch = require("../models/Branch");
const Semester = require("../models/Semester");
const Section = require("../models/Section");
const CampusBranchAvailability = require("../models/CampusBranchAvailability");

const validateCampusBranchAvailability = async (campusId, branchId) => {
    if (campusId && branchId) {
        const availability = await CampusBranchAvailability.findOne({
            campusId,
            branchId
        });

        if (!availability || availability.isAvailable === false) {
            throw new Error("Campus and Branch combination is not available");
        }
    }
};

const createStudent = async (data, user = null) => {
    if (user && user.role === "CTPO") {
        if (!data.branchId || !user.scopeRef?.refId || data.branchId.toString() !== user.scopeRef.refId.toString() || data.year !== 4) {
            throw new Error("Forbidden: CTPO can manage 4th-year students only in the assigned branch");
        }
    }

    await validateCampusBranchAvailability(data.campusId, data.branchId);
    return await Student.create(data);
};

const createStudents = async (data, user = null) => {
    if (Array.isArray(data)) {
        for (const item of data) {
            if (user && user.role === "CTPO") {
                if (!item.branchId || !user.scopeRef?.refId || item.branchId.toString() !== user.scopeRef.refId.toString() || item.year !== 4) {
                    throw new Error("Forbidden: CTPO can manage 4th-year students only in the assigned branch");
                }
            }
            await validateCampusBranchAvailability(item.campusId, item.branchId);
        }
    }
    return await Student.insertMany(data);
};

const getAllStudents = async (filter = {}) => {
    const students = await Student.find(filter)
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");

    const Backlog = require("../models/Backlog");
    const studentIds = students.map((s) => s._id);

    const backlogs = await Backlog.find({ studentId: { $in: studentIds } })
        .populate("subjectId", "subjectName code")
        .populate("semesterId", "semesterCode year");

    const backlogMap = {};
    for (const b of backlogs) {
        const sId = b.studentId.toString();
        if (!backlogMap[sId]) backlogMap[sId] = [];
        backlogMap[sId].push(b);
    }

    return students.map((stu) => {
        const stuObj = stu.toObject ? stu.toObject() : { ...stu };
        const stuBacklogs = backlogMap[stu._id.toString()] || [];
        stuObj.backlogCount = stuBacklogs.length;
        stuObj.backlogs = {
            count: stuBacklogs.length,
            details: stuBacklogs.map((b) => ({
                id: b._id,
                semester: b.semesterId?.semesterCode || "N/A",
                semesterCode: b.semesterId?.semesterCode || "N/A",
                subjectCode: b.subjectId?.code || "SUB",
                subjectName: b.subjectId?.subjectName || "Subject",
                status: b.status || "OPEN"
            }))
        };
        return stuObj;
    });
};

const getStudentById = async (id, user = null) => {
    const student = await Student.findById(id)
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");

    if (!student) return null;

    if (user) {
        const { role, username, scopeRef } = user;

        if (role === "STUDENT" && student.rollNo !== username) {
            throw new Error("Forbidden: Access denied to other student records");
        }

        if (role === "CTPO") {
            const studentBranchId = student.branchId?._id ? student.branchId._id.toString() : student.branchId?.toString();
            if (
                !scopeRef ||
                scopeRef.type !== "BRANCH" ||
                studentBranchId !== scopeRef.refId.toString() ||
                student.year !== 4
            ) {
                throw new Error("Forbidden: Access denied outside your branch scope");
            }
        }

        if (role === "HOD") {
            if (student.year !== 4) {
                throw new Error("Forbidden: HOD access is restricted to 4th-year student records ONLY");
            }
        }

        if (role === "PRINCIPAL") {
            const studentCampusId = student.campusId?._id ? student.campusId._id.toString() : student.campusId?.toString();
            if (
                !scopeRef ||
                scopeRef.type !== "CAMPUS" ||
                studentCampusId !== scopeRef.refId.toString()
            ) {
                throw new Error("Forbidden: Access denied outside your assigned campus scope");
            }
        }
    }

    const Backlog = require("../models/Backlog");
    const Result = require("../models/Result");
    const backlogs = await Backlog.find({ studentId: student._id })
        .populate("subjectId", "subjectName code")
        .populate("semesterId", "semesterCode year")
        .populate("resultId", "grade resultStatus");

    const stuObj = student.toObject ? student.toObject() : { ...student };
    stuObj.backlogCount = backlogs.length;
    stuObj.backlogs = {
        count: backlogs.length,
        details: backlogs.map((b) => ({
            id: b._id,
            semester: b.semesterId?.semesterCode || "N/A",
            semesterCode: b.semesterId?.semesterCode || "N/A",
            subjectCode: b.subjectId?.code || "SUB",
            subjectName: b.subjectId?.subjectName || "Subject",
            status: b.status || "OPEN",
            result: b.resultId?.grade || (b.status === "CLEARED" ? "P" : "F"),
            attempts: 1
        }))
    };

    return stuObj;
};

const updateStudent = async (id, data, user = null) => {
    const student = await Student.findById(id);
    if (!student) return null;

    if (user && user.role === "CTPO") {
        const studentBranchId = student.branchId?._id ? student.branchId._id.toString() : student.branchId?.toString();
        if (!user.scopeRef?.refId || user.scopeRef.type !== "BRANCH" || studentBranchId !== user.scopeRef.refId.toString() || student.year !== 4) {
            throw new Error("Forbidden: CTPO can manage 4th-year students only in the assigned branch");
        }
        if (data.branchId && data.branchId.toString() !== user.scopeRef.refId.toString()) {
            throw new Error("Forbidden: CTPO cannot move student to another branch");
        }
        if (data.year && data.year !== 4) {
            throw new Error("Forbidden: CTPO can manage 4th-year students only");
        }
    }

    const campusId = data.campusId || (student.campusId?._id || student.campusId);
    const branchId = data.branchId || (student.branchId?._id || student.branchId);

    await validateCampusBranchAvailability(campusId, branchId);

    return await Student.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");
};

const deleteStudent = async (id, user = null) => {
    const student = await Student.findById(id);
    if (!student) return null;

    if (user && user.role === "CTPO") {
        const studentBranchId = student.branchId?._id ? student.branchId._id.toString() : student.branchId?.toString();
        if (!user.scopeRef?.refId || user.scopeRef.type !== "BRANCH" || studentBranchId !== user.scopeRef.refId.toString() || student.year !== 4) {
            throw new Error("Forbidden: CTPO can manage 4th-year students only in the assigned branch");
        }
    }

    return await Student.findByIdAndDelete(id);
};

const getMyProfile = async (user) => {
    if (!user || user.role !== "STUDENT") {
        throw new Error("Forbidden: Access restricted to student role");
    }

    const student = await Student.findOne({ rollNo: user.username })
        .populate("campusId", "name code")
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("sectionId", "sectionName year");

    if (!student) {
        throw new Error("Student record not found");
    }

    const MidMark = require("../models/MidMark");
    const Backlog = require("../models/Backlog");
    const Result = require("../models/Result");

    const [midMarks, backlogs] = await Promise.all([
        MidMark.find({ studentId: student._id })
            .populate("subjectId", "subjectName code")
            .populate("semesterId", "semesterCode year"),
        Backlog.find({ studentId: student._id })
            .populate("subjectId", "subjectName code")
            .populate("semesterId", "semesterCode year")
            .populate("resultId", "grade resultStatus")
    ]);

    // Format backlog details
    const backlogDetails = backlogs.map((b) => ({
        id: b._id,
        semester: b.semesterId?.semesterCode || "N/A",
        semesterCode: b.semesterId?.semesterCode || "N/A",
        subjectCode: b.subjectId?.code || "SUB",
        subjectName: b.subjectId?.subjectName || "Subject",
        status: b.status || "OPEN",
        result: b.resultId?.grade || (b.status === "CLEARED" ? "P" : "F"),
        attempts: 1
    }));

    // Calculate semester-wise backlog counts
    const semMap = {};
    for (const b of backlogs) {
        const semName = b.semesterId?.semesterCode || "Unknown";
        semMap[semName] = (semMap[semName] || 0) + 1;
    }
    const semesterWise = Object.entries(semMap).map(([semesterCode, count]) => ({
        semesterCode,
        count
    }));

    return {
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branchId,
        semester: student.semesterId,
        section: student.sectionId,
        campus: student.campusId,
        year: student.year,
        midMarks,
        backlogs: {
            available: true,
            count: backlogDetails.length,
            totalCount: backlogDetails.length,
            semesterWise,
            details: backlogDetails
        }
    };
};

module.exports = {
    createStudent,
    createStudents,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyProfile,
    validateCampusBranchAvailability
};