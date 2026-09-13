const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Team 2 model
const Timetable = require("../models/Timetable");

// Team 1 academic-master models
const Semester = require("../../academic-master/models/Semester");
const Branch = require("../../academic-master/models/Branch");
const Student = require("../../academic-master/models/Student");

const normalizeMidExam = (val) => {
    if (!val) return null;

    const s = String(val).trim().toUpperCase();

    if (
        s === "MID-1" ||
        s === "MID1" ||
        s === "1" ||
        s === "MID 1"
    ) {
        return "MID-1";
    }

    if (
        s === "MID-2" ||
        s === "MID2" ||
        s === "2" ||
        s === "MID 2"
    ) {
        return "MID-2";
    }

    return null;
};


const uploadTimetable = async (data, file, user) => {
    if (!file) {
        throw new Error("No timetable file uploaded");
    }

    let branchId;

    // CTPO can upload only for assigned branch
    if (user.role === "CTPO") {
        if (
            !user.scopeRef ||
            user.scopeRef.type !== "BRANCH" ||
            !user.scopeRef.refId
        ) {
            throw new Error(
                "Forbidden: CTPO does not have a valid branch assignment"
            );
        }

        branchId = user.scopeRef.refId;

    // Admin can upload for any branch
    } else if (user.role === "ADMIN") {
        if (
            !data.branchId ||
            !mongoose.Types.ObjectId.isValid(data.branchId)
        ) {
            throw new Error(
                "Valid branchId is required for Admin timetable upload"
            );
        }

        branchId = data.branchId;

    } else {
        throw new Error(
            "Forbidden: Unauthorized role for timetable upload"
        );
    }


    const { semesterId, timetableType, midExam } = data;

    const year = data.year
        ? parseInt(data.year, 10)
        : 4;


    // Validate semesterId
    if (
        !semesterId ||
        !mongoose.Types.ObjectId.isValid(semesterId)
    ) {
        throw new Error("Valid semesterId is required");
    }


    // Check semester
    const semester = await Semester.findById(semesterId);

    if (!semester) {
        throw new Error("Semester not found");
    }


    // Validate timetable type
    if (!["MID", "SEMESTER"].includes(timetableType)) {
        throw new Error(
            "timetableType must be either 'MID' or 'SEMESTER'"
        );
    }


    let normalizedMidExam = null;

    // MID timetable
    if (timetableType === "MID") {

        normalizedMidExam = normalizeMidExam(midExam);

        if (!normalizedMidExam) {
            throw new Error(
                "Valid midExam ('MID-1', 'MID-2') is required for MID timetable"
            );
        }

    // Semester timetable
    } else if (timetableType === "SEMESTER") {
        normalizedMidExam = null;
    }


    // Check branch
    const branch = await Branch.findById(branchId);

    if (!branch) {
        throw new Error("Branch not found");
    }


    // Check if timetable already exists
    const existing = await Timetable.findOne({
        branchId,
        semesterId,
        year,
        timetableType,
        midExam: normalizedMidExam
    });


    // Delete old uploaded file if replacing timetable
    if (
        existing &&
        existing.file?.path &&
        fs.existsSync(existing.file.path)
    ) {
        try {
            fs.unlinkSync(existing.file.path);
        } catch (err) {
            // Ignore file deletion error
        }
    }


    // File information
    const fileMeta = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path
    };


    // Create or update timetable
    const timetable = await Timetable.findOneAndUpdate(
        {
            branchId,
            semesterId,
            year,
            timetableType,
            midExam: normalizedMidExam
        },
        {
            branchId,
            semesterId,
            year,
            timetableType,
            midExam: normalizedMidExam,
            file: fileMeta,
            uploadedBy: user._id
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    )
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year");


    return formatTimetable(timetable);
};


const formatTimetable = (tt) => {

    if (!tt) {
        return null;
    }

    const doc = tt.toObject
        ? tt.toObject()
        : { ...tt };


    if (doc.file && doc.file.filename) {

        doc.fileUrl =
            `/uploads/timetables/${doc.file.filename}`;

        doc.fileName =
            doc.file.originalName;

        doc.fileType =
            (
                doc.file.mimeType &&
                doc.file.mimeType.includes("pdf")
            )
                ? "pdf"
                : "image";
    }


    doc.uploadedAt = doc.createdAt;

    return doc;
};


const getBranchTimetables = async (
    filter = {},
    user = null
) => {

    const query = {};


    // CTPO sees only assigned branch
    if (user && user.role === "CTPO") {

        if (
            !user.scopeRef ||
            user.scopeRef.type !== "BRANCH"
        ) {
            throw new Error(
                "Forbidden: CTPO does not have a valid branch assignment"
            );
        }

        query.branchId =
            user.scopeRef.refId;

    } else if (filter.branchId) {

        query.branchId =
            filter.branchId;
    }


    if (filter.semesterId) {
        query.semesterId =
            filter.semesterId;
    }

    if (filter.timetableType) {
        query.timetableType =
            filter.timetableType;
    }

    if (filter.midExam) {
        query.midExam =
            normalizeMidExam(filter.midExam) ||
            filter.midExam;
    }

    if (filter.year) {
        query.year =
            parseInt(filter.year, 10);
    }


    const timetables =
        await Timetable.find(query)
            .populate(
                "branchId",
                "name code"
            )
            .populate(
                "semesterId",
                "semesterCode year"
            )
            .populate(
                "uploadedBy",
                "username role"
            )
            .sort({
                year: -1,
                createdAt: -1
            });


    return timetables.map(formatTimetable);
};


const getMyTimetable = async (user) => {

    if (
        !user ||
        user.role !== "STUDENT"
    ) {
        throw new Error(
            "Forbidden: Access restricted to student role"
        );
    }


    const student =
        await Student.findOne({
            rollNo: user.username
        });


    if (!student) {
        throw new Error(
            "Student record not found"
        );
    }


    const timetables =
        await Timetable.find({
            branchId: student.branchId,
            semesterId: student.semesterId,
            year: student.year
        })
            .populate(
                "branchId",
                "name code"
            )
            .populate(
                "semesterId",
                "semesterCode year"
            )
            .sort({
                timetableType: 1,
                midExam: 1
            });


    return {
        student: {
            rollNo: student.rollNo,
            name: student.name,
            year: student.year
        },

        timetables:
            timetables.map(formatTimetable)
    };
};


const getTimetableById = async (
    id,
    user = null
) => {

    if (
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        throw new Error(
            "Invalid timetable ID"
        );
    }


    const timetable =
        await Timetable.findById(id)
            .populate(
                "branchId",
                "name code"
            )
            .populate(
                "semesterId",
                "semesterCode year"
            );


    if (!timetable) {
        return null;
    }


    if (user) {

        // CTPO access
        if (user.role === "CTPO") {

            if (
                !user.scopeRef ||
                user.scopeRef.type !== "BRANCH" ||
                timetable.branchId._id.toString() !==
                    user.scopeRef.refId.toString()
            ) {
                throw new Error(
                    "Forbidden: Access denied outside your branch scope"
                );
            }
        }

        // Student access
        else if (user.role === "STUDENT") {

            const student =
                await Student.findOne({
                    rollNo: user.username
                });


            if (
                !student ||
                student.branchId.toString() !==
                    timetable.branchId._id.toString()
            ) {
                throw new Error(
                    "Forbidden: Access denied to other branch timetables"
                );
            }
        }
    }


    return formatTimetable(timetable);
};


const deleteTimetable = async (
    id,
    user = null
) => {

    if (
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        throw new Error(
            "Invalid timetable ID"
        );
    }


    const timetable =
        await Timetable.findById(id);


    if (!timetable) {
        return null;
    }


    // CTPO can delete only assigned branch timetable
    if (
        user &&
        user.role === "CTPO"
    ) {

        if (
            !user.scopeRef ||
            user.scopeRef.type !== "BRANCH" ||
            timetable.branchId.toString() !==
                user.scopeRef.refId.toString()
        ) {
            throw new Error(
                "Forbidden: CTPO can delete timetables only for assigned branch"
            );
        }
    }


    // Delete uploaded file
    if (
        timetable.file?.path &&
        fs.existsSync(timetable.file.path)
    ) {

        try {
            fs.unlinkSync(
                timetable.file.path
            );
        } catch (err) {
            // Ignore file deletion error
        }
    }


    return await Timetable.findByIdAndDelete(id);
};


module.exports = {
    uploadTimetable,
    getBranchTimetables,
    getMyTimetable,
    getTimetableById,
    deleteTimetable
};
