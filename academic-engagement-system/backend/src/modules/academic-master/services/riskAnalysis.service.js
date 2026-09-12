const mongoose = require("mongoose");
const Student = require("../models/Student");
const MidMark = require("../models/MidMark");
const Subject = require("../models/Subject");
const Branch = require("../models/Branch");
const Backlog = require("../models/Backlog");

const calculateBranchRiskAnalysis = async (branchId, user = null) => {
    if (user && user.role === "CTPO") {
        if (!user.scopeRef || user.scopeRef.type !== "BRANCH" || !user.scopeRef.refId) {
            throw new Error("Forbidden: CTPO does not have a valid branch assignment");
        }
        branchId = user.scopeRef.refId;
    }

    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
        throw new Error("Valid branchId is required for risk analysis");
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
        throw new Error("Branch not found");
    }

    // 1. Fetch all 4th-year students in this branch
    const students = await Student.find({ branchId, year: 4 })
        .populate("sectionId", "sectionName")
        .populate("semesterId", "semesterCode year");

    const totalStudents = students.length;
    const studentIds = students.map((s) => s._id);

    // 2. Fetch all real backlogs for these branch students from MongoDB
    const branchBacklogs = await Backlog.find({ studentId: { $in: studentIds } })
        .populate("subjectId", "subjectName code")
        .populate("semesterId", "semesterCode year");

    const studentBacklogMap = {};
    const studentsWithBacklogsSet = new Set();
    const semBacklogMap = {};
    const subBacklogMap = {};

    for (const b of branchBacklogs) {
        const sId = b.studentId.toString();
        if (!studentBacklogMap[sId]) studentBacklogMap[sId] = [];
        studentBacklogMap[sId].push(b);
        studentsWithBacklogsSet.add(sId);

        const semCode = b.semesterId?.semesterCode || "Unknown";
        semBacklogMap[semCode] = (semBacklogMap[semCode] || 0) + 1;

        const subName = b.subjectId?.subjectName || "Subject";
        subBacklogMap[subName] = (subBacklogMap[subName] || 0) + 1;
    }

    const totalBacklogs = branchBacklogs.length;
    const studentsWithBacklogs = studentsWithBacklogsSet.size;
    const studentsWithoutBacklogs = Math.max(0, totalStudents - studentsWithBacklogs);

    const semesterWiseBacklogs = Object.entries(semBacklogMap).map(([semesterCode, count]) => ({
        semesterCode,
        count
    }));

    const backlogSummary = Object.entries(subBacklogMap).map(([subjectName, count]) => ({
        subjectName,
        count
    }));

    // 3. Fetch all mid marks for this branch
    const midMarks = await MidMark.find({ branchId })
        .populate("subjectId", "subjectName code")
        .populate("studentId", "rollNo name");

    // 4. Compute overall, MID-1, and MID-2 performance
    const subjectStats = {};
    const mid1Stats = {};
    const mid2Stats = {};
    const studentPerformanceMap = {};

    // Initialize student performance map
    for (const stu of students) {
        studentPerformanceMap[stu._id.toString()] = {
            studentId: stu._id,
            rollNo: stu.rollNo,
            name: stu.name,
            section: stu.sectionId?.sectionName || "N/A",
            totalMarksObtained: 0,
            totalMaxMarks: 0,
            marksCount: 0,
            failedSubjects: new Set(),
            passedSubjects: new Set(),
            backlogCount: (studentBacklogMap[stu._id.toString()] || []).length
        };
    }

    for (const mark of midMarks) {
        const stuIdStr = mark.studentId?._id ? mark.studentId._id.toString() : mark.studentId?.toString();
        const subIdStr = mark.subjectId?._id ? mark.subjectId._id.toString() : mark.subjectId?.toString() || "unknown";
        const subName = mark.subjectId?.subjectName || "Subject";

        // Overall subject stats
        if (!subjectStats[subIdStr]) {
            subjectStats[subIdStr] = {
                subjectId: subIdStr,
                subjectName: subName,
                totalMarks: 0,
                totalMax: 0,
                totalAppeared: 0,
                failedStudentsSet: new Set(),
                failedStudentDetails: []
            };
        }

        subjectStats[subIdStr].totalMarks += mark.marks;
        subjectStats[subIdStr].totalMax += mark.maxMarks || 30;
        subjectStats[subIdStr].totalAppeared += 1;

        const isFailed = mark.marks < (mark.maxMarks ? mark.maxMarks * 0.4 : 12);
        if (isFailed) {
            subjectStats[subIdStr].failedStudentsSet.add(stuIdStr);
            if (mark.studentId && typeof mark.studentId === "object") {
                subjectStats[subIdStr].failedStudentDetails.push({
                    rollNo: mark.studentId.rollNo,
                    name: mark.studentId.name,
                    marks: mark.marks,
                    midExam: mark.midExam
                });
            }
        }

        // MID-1 breakdown
        if (mark.midExam === "MID-1") {
            if (!mid1Stats[subIdStr]) {
                mid1Stats[subIdStr] = {
                    subjectId: subIdStr,
                    subjectName: subName,
                    totalMarks: 0,
                    totalAppeared: 0,
                    failedStudentsSet: new Set()
                };
            }
            mid1Stats[subIdStr].totalMarks += mark.marks;
            mid1Stats[subIdStr].totalAppeared += 1;
            if (isFailed) mid1Stats[subIdStr].failedStudentsSet.add(stuIdStr);
        }

        // MID-2 breakdown
        if (mark.midExam === "MID-2") {
            if (!mid2Stats[subIdStr]) {
                mid2Stats[subIdStr] = {
                    subjectId: subIdStr,
                    subjectName: subName,
                    totalMarks: 0,
                    totalAppeared: 0,
                    failedStudentsSet: new Set()
                };
            }
            mid2Stats[subIdStr].totalMarks += mark.marks;
            mid2Stats[subIdStr].totalAppeared += 1;
            if (isFailed) mid2Stats[subIdStr].failedStudentsSet.add(stuIdStr);
        }

        // Student stats tracker
        if (studentPerformanceMap[stuIdStr]) {
            studentPerformanceMap[stuIdStr].totalMarksObtained += mark.marks;
            studentPerformanceMap[stuIdStr].totalMaxMarks += mark.maxMarks || 30;
            studentPerformanceMap[stuIdStr].marksCount += 1;

            if (isFailed) {
                studentPerformanceMap[stuIdStr].failedSubjects.add(subIdStr);
            } else {
                studentPerformanceMap[stuIdStr].passedSubjects.add(subIdStr);
            }
        }
    }

    const subjectPerformance = Object.values(subjectStats).map((sub) => ({
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        totalAppeared: sub.totalAppeared,
        failedStudents: sub.failedStudentsSet.size,
        averageMarks: sub.totalAppeared > 0 ? parseFloat((sub.totalMarks / sub.totalAppeared).toFixed(2)) : 0
    }));

    const mid1SubjectPerformance = Object.values(mid1Stats).map((sub) => ({
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        totalAppeared: sub.totalAppeared,
        failedStudents: sub.failedStudentsSet.size,
        averageMarks: sub.totalAppeared > 0 ? parseFloat((sub.totalMarks / sub.totalAppeared).toFixed(2)) : 0
    }));

    const mid2SubjectPerformance = Object.values(mid2Stats).map((sub) => ({
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        totalAppeared: sub.totalAppeared,
        failedStudents: sub.failedStudentsSet.size,
        averageMarks: sub.totalAppeared > 0 ? parseFloat((sub.totalMarks / sub.totalAppeared).toFixed(2)) : 0
    }));

    const subjectFailures = Object.values(subjectStats)
        .filter((sub) => sub.failedStudentsSet.size > 0)
        .map((sub) => ({
            subjectId: sub.subjectId,
            subjectName: sub.subjectName,
            failedStudentsCount: sub.failedStudentsSet.size,
            students: sub.failedStudentDetails
        }));

    // 5. Categorize student risk levels based on Backlogs + Mid Failures
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let studentsWithMidFailures = 0;
    let totalBranchMarks = 0;
    let totalMarksCount = 0;

    const highRiskStudentsList = [];
    const mediumRiskStudentsList = [];
    const lowRiskStudentsList = [];

    for (const stuIdStr in studentPerformanceMap) {
        const perf = studentPerformanceMap[stuIdStr];
        const failCount = perf.failedSubjects.size;
        const bCount = perf.backlogCount || 0;
        const avgPercentage = perf.totalMaxMarks > 0 ? (perf.totalMarksObtained / perf.totalMaxMarks) * 100 : null;

        if (perf.marksCount > 0) {
            totalBranchMarks += perf.totalMarksObtained;
            totalMarksCount += perf.marksCount;
        }

        if (failCount > 0) {
            studentsWithMidFailures++;
        }

        let riskLevel = "LOW";

        if (failCount >= 2 || bCount >= 2 || (avgPercentage !== null && avgPercentage < 35)) {
            riskLevel = "HIGH";
            highRiskCount++;
            highRiskStudentsList.push({
                studentId: perf.studentId,
                rollNo: perf.rollNo,
                name: perf.name,
                section: perf.section,
                failedSubjectCount: failCount,
                backlogCount: bCount,
                averageScore: avgPercentage !== null ? parseFloat(avgPercentage.toFixed(1)) : 0,
                riskLevel: "HIGH"
            });
        } else if (failCount === 1 || bCount === 1 || (avgPercentage !== null && avgPercentage >= 35 && avgPercentage < 50)) {
            riskLevel = "MEDIUM";
            mediumRiskCount++;
            mediumRiskStudentsList.push({
                studentId: perf.studentId,
                rollNo: perf.rollNo,
                name: perf.name,
                section: perf.section,
                failedSubjectCount: failCount,
                backlogCount: bCount,
                averageScore: avgPercentage !== null ? parseFloat(avgPercentage.toFixed(1)) : 0,
                riskLevel: "MEDIUM"
            });
        } else {
            riskLevel = "LOW";
            lowRiskCount++;
            lowRiskStudentsList.push({
                studentId: perf.studentId,
                rollNo: perf.rollNo,
                name: perf.name,
                section: perf.section,
                failedSubjectCount: 0,
                backlogCount: bCount,
                averageScore: avgPercentage !== null ? parseFloat(avgPercentage.toFixed(1)) : 0,
                riskLevel: "LOW"
            });
        }
    }

    const averageBranchMarks = totalMarksCount > 0 ? parseFloat((totalBranchMarks / totalMarksCount).toFixed(2)) : 0;

    return {
        branch: {
            id: branch._id,
            name: branch.name,
            code: branch.code
        },
        year: 4,
        totalStudents,
        studentsWithBacklogs,
        studentsWithoutBacklogs,
        totalBacklogs,
        backlogSummary,
        semesterWiseBacklogs,
        mid1: {
            subjectPerformance: mid1SubjectPerformance
        },
        mid2: {
            subjectPerformance: mid2SubjectPerformance
        },
        subjectFailures,
        metrics: {
            totalStudents,
            evaluatedStudents: Object.values(studentPerformanceMap).filter((s) => s.marksCount > 0).length,
            studentsWithMidFailures,
            studentsWithBacklogs,
            studentsWithoutBacklogs,
            totalBacklogs,
            averageBranchMarks,
            highRiskStudents: highRiskCount,
            mediumRiskStudents: mediumRiskCount,
            lowRiskStudents: lowRiskCount
        },
        riskDistribution: {
            HIGH: highRiskCount,
            MEDIUM: mediumRiskCount,
            LOW: lowRiskCount
        },
        subjectPerformance,
        studentsByRisk: {
            HIGH: highRiskStudentsList,
            MEDIUM: mediumRiskStudentsList,
            LOW: lowRiskStudentsList
        },
        backlogMetrics: {
            available: true,
            message: totalBacklogs > 0 ? `Real-time backlog records: ${totalBacklogs} active across ${studentsWithBacklogs} students` : "No backlogs recorded for this branch",
            totalBacklogs,
            studentsWithBacklogs,
            studentsWithoutBacklogs,
            semesterWise: semesterWiseBacklogs,
            distribution: backlogSummary
        }
    };
};

module.exports = {
    calculateBranchRiskAnalysis
};
