const Student = require("../models/Student");
const Campus = require("../models/Campus");
const Branch = require("../models/Branch");
const Section = require("../models/Section");
const Subject = require("../models/Subject");
const Semester = require("../models/Semester");
const AcademicYear = require("../models/AcademicYear");
const User = require("../models/User");

const getDashboardData = async (user) => {
    const { role, username, scopeRef } = user;

    if (role === "STUDENT") {
        const student = await Student.findOne({ rollNo: username })
            .populate("campusId", "name code")
            .populate("branchId", "name code")
            .populate("semesterId", "semesterCode year")
            .populate("sectionId", "sectionName year");

        return {
            role: "STUDENT",
            student: student || null
        };
    }

    if (role === "CTPO") {
        const sectionId = scopeRef?.refId;
        const section = sectionId ? await Section.findById(sectionId).populate("branchId", "name code") : null;
        const studentCount = sectionId ? await Student.countDocuments({ sectionId }) : 0;

        return {
            role: "CTPO",
            section,
            studentCount
        };
    }

    if (role === "HOD") {
        const totalYear4Students = await Student.countDocuments({ year: 4 });
        const branchBreakdown = await Student.aggregate([
            { $match: { year: 4 } },
            { $group: { _id: "$branchId", count: { $sum: 1 } } }
        ]);

        return {
            role: "HOD",
            yearAccess: 4,
            branchesAccess: "ALL",
            totalStudents: totalYear4Students,
            branchBreakdown
        };
    }

    if (role === "PRINCIPAL") {
        const campusId = scopeRef?.refId;
        const campus = campusId ? await Campus.findById(campusId) : null;
        const studentCount = campusId ? await Student.countDocuments({ campusId }) : 0;

        return {
            role: "PRINCIPAL",
            campus,
            studentCount
        };
    }

    if (role === "COORDINATOR") {
        const totalSubjects = await Subject.countDocuments();
        const subjectsBySemester = await Subject.aggregate([
            { $group: { _id: "$semesterId", count: { $sum: 1 } } }
        ]);

        return {
            role: "COORDINATOR",
            subjectsAccess: "ALL",
            totalSubjects,
            subjectsBySemester
        };
    }

    if (role === "ADMIN") {
        const campusCount = await Campus.countDocuments();
        const branchCount = await Branch.countDocuments();
        const academicYearCount = await AcademicYear.countDocuments();
        const semesterCount = await Semester.countDocuments();
        const sectionCount = await Section.countDocuments();
        const subjectCount = await Subject.countDocuments();
        const studentCount = await Student.countDocuments();
        const userCount = await User.countDocuments();

        return {
            role: "ADMIN",
            counts: {
                campuses: campusCount,
                branches: branchCount,
                academicYears: academicYearCount,
                semesters: semesterCount,
                sections: sectionCount,
                subjects: subjectCount,
                students: studentCount,
                users: userCount
            }
        };
    }

    return { role, message: "No custom dashboard metric defined for this role" };
};

module.exports = {
    getDashboardData
};
