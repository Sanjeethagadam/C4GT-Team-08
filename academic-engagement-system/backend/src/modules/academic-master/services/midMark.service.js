const mongoose = require("mongoose");
const MidMark = require("../models/MidMark");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Semester = require("../models/Semester");
const Branch = require("../models/Branch");

const validateMidMarkScope = (user, student) => {
    if (!user) return;
    if (user.role === "STUDENT") {
        if (student.rollNo !== user.username) {
            throw new Error("Forbidden: Access denied to other student records");
        }
    } else if (user.role === "CTPO") {
        const studentBranchId = student.branchId?._id ? student.branchId._id.toString() : student.branchId?.toString();
        if (
            !user.scopeRef ||
            user.scopeRef.type !== "BRANCH" ||
            studentBranchId !== user.scopeRef.refId.toString() ||
            student.year !== 4
        ) {
            throw new Error("Forbidden: CTPO can manage mid marks only for 4th-year students in assigned branch");
        }
    } else if (user.role === "HOD") {
        if (student.year !== 4) {
            throw new Error("Forbidden: HOD access is restricted to 4th-year student records ONLY");
        }
    }
};

const normalizeMidExam = (val) => {
    if (!val) return null;
    const s = String(val).trim().toUpperCase();
    if (s === "MID-1" || s === "MID1" || s === "1" || s === "MID 1") return "MID-1";
    if (s === "MID-2" || s === "MID2" || s === "2" || s === "MID 2") return "MID-2";
    return null;
};

/**
 * Enter or batch-enter mid marks for a student in a semester.
 * Payload structure:
 * {
 *   studentId: "...",
 *   semesterId: "...",
 *   midExam: "MID-1" or 1,
 *   marks: [
 *     { subjectId: "...", marks: 18, maxMarks: 30 }
 *   ]
 * }
 * OR single mark:
 * {
 *   studentId: "...",
 *   semesterId: "...",
 *   subjectId: "...",
 *   midExam: "MID-1" or 1,
 *   marks: 18,
 *   maxMarks: 30
 * }
 */
const enterMidMarks = async (data, user = null) => {
    const { studentId, semesterId, midExam } = data;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Valid studentId is required");
    }
    if (!semesterId || !mongoose.Types.ObjectId.isValid(semesterId)) {
        throw new Error("Valid semesterId is required");
    }

    const normalizedMidExam = normalizeMidExam(midExam);
    if (!normalizedMidExam) {
        throw new Error("Valid midExam ('MID-1', 'MID-2') is required");
    }

    const student = await Student.findById(studentId);
    if (!student) {
        throw new Error("Student not found");
    }

    validateMidMarkScope(user, student);

    const semester = await Semester.findById(semesterId);
    if (!semester) {
        throw new Error("Semester not found");
    }

    const branchId = student.branchId;

    // Normalise mark entries into an array
    let entries = [];
    if (Array.isArray(data.marks)) {
        entries = data.marks;
    } else if (data.subjectId !== undefined && (data.marks !== undefined || data.marksObtained !== undefined)) {
        const singleVal = data.marks !== undefined ? data.marks : data.marksObtained;
        entries = [{ subjectId: data.subjectId, marks: singleVal, maxMarks: data.maxMarks || 30 }];
    } else {
        throw new Error("Marks payload must contain subjectId and marks (or an array of { subjectId, marks })");
    }

    if (entries.length === 0) {
        throw new Error("At least one subject mark entry is required");
    }

    const results = [];

    for (const item of entries) {
        const { subjectId, maxMarks = 30 } = item;
        const marks = item.marks !== undefined ? item.marks : item.marksObtained;

        if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
            throw new Error("Valid subjectId is required for each mark entry");
        }

        if (typeof marks !== "number" || isNaN(marks)) {
            throw new Error(`Marks value must be a valid number for subject ${subjectId}`);
        }

        if (marks < 0) {
            throw new Error("Marks cannot be negative");
        }

        if (marks > maxMarks) {
            throw new Error(`Marks (${marks}) cannot exceed maximum allowed marks (${maxMarks})`);
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            throw new Error(`Subject ${subjectId} not found`);
        }

        // Validate subject belongs to the given semester
        if (subject.semesterId.toString() !== semesterId.toString()) {
            throw new Error(`Subject '${subject.subjectName}' does not belong to selected semester`);
        }

        // Validate subject belongs to student's branch
        if (subject.branchId.toString() !== branchId.toString()) {
            throw new Error(`Subject '${subject.subjectName}' does not belong to student's branch`);
        }

        // Upsert mark record
        const savedMark = await MidMark.findOneAndUpdate(
            {
                studentId: student._id,
                semesterId: semester._id,
                subjectId: subject._id,
                midExam: normalizedMidExam
            },
            {
                studentId: student._id,
                branchId,
                semesterId: semester._id,
                subjectId: subject._id,
                midExam: normalizedMidExam,
                marks,
                maxMarks,
                enteredBy: user ? user._id : null
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        ).populate("subjectId", "subjectName");

        results.push(savedMark);
    }

    return results;
};

const updateMidMark = async (id, data, user = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid mid mark ID");
    }

    const midMark = await MidMark.findById(id);
    if (!midMark) {
        throw new Error("Mid mark record not found");
    }

    if (user && user.role === "CTPO") {
        if (!user.scopeRef || user.scopeRef.type !== "BRANCH" || midMark.branchId.toString() !== user.scopeRef.refId.toString()) {
            throw new Error("Forbidden: CTPO can update marks only for assigned branch");
        }
    }

    if (data.marks !== undefined) {
        if (typeof data.marks !== "number" || isNaN(data.marks)) {
            throw new Error("Marks value must be a valid number");
        }
        if (data.marks < 0) {
            throw new Error("Marks cannot be negative");
        }
        const maxMarks = data.maxMarks !== undefined ? data.maxMarks : midMark.maxMarks;
        if (data.marks > maxMarks) {
            throw new Error(`Marks (${data.marks}) cannot exceed maximum allowed marks (${maxMarks})`);
        }
    }

    const updated = await MidMark.findByIdAndUpdate(
        id,
        {
            ...(data.marks !== undefined ? { marks: data.marks } : {}),
            ...(data.maxMarks !== undefined ? { maxMarks: data.maxMarks } : {}),
            ...(user ? { enteredBy: user._id } : {})
        },
        { new: true, runValidators: true }
    )
        .populate("subjectId", "subjectName")
        .populate("semesterId", "semesterCode year")
        .populate("studentId", "rollNo name");

    return updated;
};

const getStudentMidMarks = async (studentId, user = null) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID");
    }

    const student = await Student.findById(studentId);
    if (!student) {
        throw new Error("Student not found");
    }

    validateMidMarkScope(user, student);

    const marks = await MidMark.find({ studentId: student._id })
        .populate("subjectId", "subjectName")
        .populate("semesterId", "semesterCode year")
        .populate("branchId", "name code")
        .sort({ semesterId: 1, midExam: 1 });

    return {
        student: {
            id: student._id,
            rollNo: student.rollNo,
            name: student.name,
            branchId: student.branchId,
            year: student.year
        },
        marks
    };
};

const getBranchMidMarks = async (filter = {}, user = null) => {
    const query = {};

    if (user && user.role === "CTPO") {
        if (!user.scopeRef || user.scopeRef.type !== "BRANCH") {
            throw new Error("Forbidden: CTPO does not have a valid branch assignment");
        }
        query.branchId = user.scopeRef.refId;
    } else if (filter.branchId) {
        query.branchId = filter.branchId;
    }

    if (filter.semesterId) query.semesterId = filter.semesterId;
    if (filter.midExam) query.midExam = normalizeMidExam(filter.midExam) || filter.midExam;
    if (filter.studentId) query.studentId = filter.studentId;

    return await MidMark.find(query)
        .populate("studentId", "rollNo name year")
        .populate("subjectId", "subjectName")
        .populate("semesterId", "semesterCode year")
        .populate("branchId", "name code")
        .sort({ createdAt: -1 });
};

const getMyMidMarks = async (user) => {
    if (!user || user.role !== "STUDENT") {
        throw new Error("Forbidden: Access restricted to student role");
    }

    const student = await Student.findOne({ rollNo: user.username })
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("campusId", "name code")
        .populate("sectionId", "sectionName year");

    if (!student) {
        throw new Error("Student record not found for authenticated user");
    }

    const marks = await MidMark.find({ studentId: student._id })
        .populate("subjectId", "subjectName code")
        .populate("semesterId", "semesterCode year")
        .sort({ semesterId: 1, midExam: 1 });

    // Fetch enrolled subjects for student's branch and semester
    const branchId = student.branchId?._id || student.branchId;
    const semesterId = student.semesterId?._id || student.semesterId;
    const enrolledSubjects = await Subject.find({ branchId, semesterId });

    // Group marks subject-wise and semester-wise
    const groupedBySemester = {};

    // 1. First populate with enrolled semester subjects as NOT_ENTERED
    const semIdStr = semesterId ? semesterId.toString() : "current";
    const semCodeStr = student.semesterId?.semesterCode || "I SEM";

    groupedBySemester[semIdStr] = {
        semesterId: semIdStr,
        semesterCode: semCodeStr,
        year: student.year || 4,
        subjects: {}
    };

    for (const sub of enrolledSubjects) {
        const subIdStr = sub._id.toString();
        groupedBySemester[semIdStr].subjects[subIdStr] = {
            subjectId: subIdStr,
            subjectName: sub.subjectName,
            subjectCode: sub.code || "SUB",
            mid1: { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
            mid2: { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
            midExams: {
                "MID-1": { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
                "MID-2": { status: "NOT_ENTERED", marks: null, maxMarks: 30 }
            }
        };
    }

    // 2. Overlay recorded marks
    for (const m of marks) {
        const sId = m.semesterId?._id?.toString() || "unknown";
        const sCode = m.semesterId?.semesterCode || "Unknown";

        if (!groupedBySemester[sId]) {
            groupedBySemester[sId] = {
                semesterId: sId,
                semesterCode: sCode,
                year: m.semesterId?.year || 4,
                subjects: {}
            };
        }

        const subId = m.subjectId?._id?.toString() || m.subjectId?.toString() || "unknown";
        const subName = m.subjectId?.subjectName || "Subject";
        const subCode = m.subjectId?.code || "SUB";

        if (!groupedBySemester[sId].subjects[subId]) {
            groupedBySemester[sId].subjects[subId] = {
                subjectId: subId,
                subjectName: subName,
                subjectCode: subCode,
                mid1: { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
                mid2: { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
                midExams: {
                    "MID-1": { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
                    "MID-2": { status: "NOT_ENTERED", marks: null, maxMarks: 30 }
                }
            };
        }

        const markEntry = {
            id: m._id,
            status: "ENTERED",
            marks: m.marks,
            maxMarks: m.maxMarks || 30
        };

        groupedBySemester[sId].subjects[subId].midExams[m.midExam] = markEntry;
        if (m.midExam === "MID-1") {
            groupedBySemester[sId].subjects[subId].mid1 = markEntry;
        } else if (m.midExam === "MID-2") {
            groupedBySemester[sId].subjects[subId].mid2 = markEntry;
        }
    }

    const formattedSemesters = Object.values(groupedBySemester).map((sem) => ({
        ...sem,
        subjects: Object.values(sem.subjects)
    }));

    // Build rawMarks list including unentered subjects so frontend tables show all subjects
    const fullRawMarks = [...marks];
    const recordedSubjectExamSet = new Set(
        marks.map((m) => `${m.subjectId?._id || m.subjectId}_${m.midExam}`)
    );

    for (const sub of enrolledSubjects) {
        if (!recordedSubjectExamSet.has(`${sub._id}_MID-1`)) {
            fullRawMarks.push({
                _id: `unentered_${sub._id}_mid1`,
                studentId: student._id,
                semesterId: student.semesterId,
                subjectId: sub,
                midExam: "MID-1",
                marks: null,
                status: "NOT_ENTERED",
                maxMarks: 30
            });
        }
        if (!recordedSubjectExamSet.has(`${sub._id}_MID-2`)) {
            fullRawMarks.push({
                _id: `unentered_${sub._id}_mid2`,
                studentId: student._id,
                semesterId: student.semesterId,
                subjectId: sub,
                midExam: "MID-2",
                marks: null,
                status: "NOT_ENTERED",
                maxMarks: 30
            });
        }
    }

    return {
        student: {
            id: student._id,
            rollNo: student.rollNo,
            name: student.name,
            branch: student.branchId,
            semester: student.semesterId,
            section: student.sectionId,
            campus: student.campusId,
            year: student.year
        },
        semesters: formattedSemesters,
        rawMarks: fullRawMarks
    };
};

module.exports = {
    enterMidMarks,
    updateMidMark,
    getStudentMidMarks,
    getBranchMidMarks,
    getMyMidMarks
};
