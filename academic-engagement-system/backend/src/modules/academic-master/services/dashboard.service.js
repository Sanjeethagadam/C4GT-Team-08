const Student = require("../models/Student");
const Campus = require("../models/Campus");
const Branch = require("../models/Branch");
const Section = require("../models/Section");
const Subject = require("../models/Subject");
const Semester = require("../models/Semester");
const AcademicYear = require("../models/AcademicYear");
const User = require("../models/User");
const MidMark = require("../models/MidMark");
const Timetable = require("../models/Timetable");
const Backlog = require("../models/Backlog");
const { calculateBranchRiskAnalysis } = require("./riskAnalysis.service");

const getDashboardData = async (user) => {
    const { role, username, scopeRef } = user;

    if (role === "STUDENT") {
        const student = await Student.findOne({ rollNo: username })
            .populate("campusId", "name code")
            .populate("branchId", "name code")
            .populate("semesterId", "semesterCode year")
            .populate("sectionId", "sectionName year");

        if (!student) {
            return {
                role: "STUDENT",
                student: null,
                message: "Student record not found"
            };
        }

        const subjects = await Subject.find({
            branchId: student.branchId?._id || student.branchId,
            semesterId: student.semesterId?._id || student.semesterId
        });

        const midMarks = await MidMark.find({ studentId: student._id })
            .populate("subjectId", "subjectName")
            .populate("semesterId", "semesterCode year");

        const timetables = await Timetable.find({
            branchId: student.branchId?._id || student.branchId,
            semesterId: student.semesterId?._id || student.semesterId,
            year: student.year
        });

        const backlogs = await Backlog.find({ studentId: student._id })
            .populate("subjectId", "subjectName code")
            .populate("semesterId", "semesterCode year");

        const backlogDetails = backlogs.map((b) => ({
            id: b._id,
            semester: b.semesterId?.semesterCode || "N/A",
            semesterCode: b.semesterId?.semesterCode || "N/A",
            subjectCode: b.subjectId?.code || "SUB",
            subjectName: b.subjectId?.subjectName || "Subject",
            status: b.status || "OPEN"
        }));

        return {
            role: "STUDENT",
            student,
            enrolledSubjects: subjects,
            midMarks,
            timetables,
            backlogs: {
                available: true,
                count: backlogDetails.length,
                totalCount: backlogDetails.length,
                details: backlogDetails
            }
        };
    }

    if (role === "CTPO") {
        const branchId = scopeRef?.refId;
        const branch = branchId ? await Branch.findById(branchId) : null;

        if (!branch) {
            return {
                role: "CTPO",
                branch: null,
                message: "No branch assigned to CTPO"
            };
        }

        // 1. Students data for year 4 in this branch
        const totalStudents = await Student.countDocuments({ branchId: branch._id, year: 4 });
        const semesterDistribution = await Student.aggregate([
            { $match: { branchId: branch._id, year: 4 } },
            { $group: { _id: "$semesterId", count: { $sum: 1 } } }
        ]);

        // Populate semester codes for distribution
        const populatedSemesterDist = await Promise.all(
            semesterDistribution.map(async (item) => {
                const sem = await Semester.findById(item._id);
                return {
                    semesterId: item._id,
                    semesterCode: sem ? sem.semesterCode : "Unknown",
                    year: sem ? sem.year : 4,
                    count: item.count
                };
            })
        );

        // 2. Mid marks summary for this branch
        const totalMidMarksEntered = await MidMark.countDocuments({ branchId: branch._id });
        const distinctEvaluatedStudents = await MidMark.distinct("studentId", { branchId: branch._id });

        // 3. Timetables summary for this branch
        const branchTimetables = await Timetable.find({ branchId: branch._id })
            .populate("semesterId", "semesterCode year");

        // 4. Risk Analysis data
        const riskAnalysis = await calculateBranchRiskAnalysis(branch._id, user);

        // Branch backlogs summary
        const branchStudentIds = await Student.find({ branchId: branch._id, year: 4 }).distinct("_id");
        const totalBranchBacklogs = await Backlog.countDocuments({ studentId: { $in: branchStudentIds } });
        const distinctBacklogStudents = await Backlog.distinct("studentId", { studentId: { $in: branchStudentIds } });

        return {
            role: "CTPO",
            branch: {
                id: branch._id,
                name: branch.name,
                code: branch.code
            },
            year: 4,
            studentsSummary: {
                totalStudents,
                semesterDistribution: populatedSemesterDist
            },
            backlogsSummary: {
                totalBacklogs: totalBranchBacklogs,
                studentsWithBacklogs: distinctBacklogStudents.length,
                studentsWithoutBacklogs: Math.max(0, totalStudents - distinctBacklogStudents.length)
            },
            midMarksSummary: {
                totalMarksEntries: totalMidMarksEntered,
                evaluatedStudentsCount: distinctEvaluatedStudents.length,
                pendingEvaluationCount: Math.max(0, totalStudents - distinctEvaluatedStudents.length)
            },
            timetablesSummary: {
                totalUploaded: branchTimetables.length,
                timetables: branchTimetables
            },
            riskAnalysis: {
                metrics: riskAnalysis.metrics,
                riskDistribution: riskAnalysis.riskDistribution,
                subjectPerformance: riskAnalysis.subjectPerformance
            }
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
        const midMarkCount = await MidMark.countDocuments();
        const timetableCount = await Timetable.countDocuments();

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
                users: userCount,
                midMarks: midMarkCount,
                timetables: timetableCount
            }
        };
    }

    return { role, message: "No custom dashboard metric defined for this role" };
};

module.exports = {
    getDashboardData
};
