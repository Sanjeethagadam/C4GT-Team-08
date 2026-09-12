const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Timetable = require("../models/Timetable");
const Semester = require("../models/Semester");
const Branch = require("../models/Branch");
const Student = require("../models/Student");

const normalizeMidExam = (val) => {
    if (!val) return null;
    const s = String(val).trim().toUpperCase();
    if (s === "MID-1" || s === "MID1" || s === "1" || s === "MID 1") return "MID-1";
    if (s === "MID-2" || s === "MID2" || s === "2" || s === "MID 2") return "MID-2";
    return null;
};

/**
 * Access the MongoDB GridFS Bucket for timetable documents within the Atlas cluster database.
 */
const getTimetableBucket = () => {
    if (!mongoose.connection || !mongoose.connection.db) {
        throw new Error("Database connection not ready for GridFS cluster storage");
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "timetables"
    });
};

/**
 * Stream a Buffer directly into the MongoDB Atlas Cluster GridFS bucket.
 */
const uploadBufferToGridFS = (buffer, filename, metadata) => {
    return new Promise((resolve, reject) => {
        const bucket = getTimetableBucket();
        const uploadStream = bucket.openUploadStream(filename, {
            metadata,
            contentType: metadata.mimeType
        });

        uploadStream.on("finish", () => {
            resolve(uploadStream.id);
        });

        uploadStream.on("error", (err) => {
            reject(err);
        });

        uploadStream.end(buffer);
    });
};

const uploadTimetable = async (data, file, user) => {
    if (!file) {
        throw new Error("No timetable file uploaded");
    }

    let branchId;
    if (user.role === "CTPO") {
        if (!user.scopeRef || user.scopeRef.type !== "BRANCH" || !user.scopeRef.refId) {
            throw new Error("Forbidden: CTPO does not have a valid branch assignment");
        }
        branchId = user.scopeRef.refId;
    } else if (user.role === "ADMIN") {
        if (!data.branchId || !mongoose.Types.ObjectId.isValid(data.branchId)) {
            throw new Error("Valid branchId is required for Admin timetable upload");
        }
        branchId = data.branchId;
    } else {
        throw new Error("Forbidden: Unauthorized role for timetable upload");
    }

    const { semesterId, timetableType, midExam } = data;
    const year = data.year ? parseInt(data.year, 10) : 4;

    if (!semesterId || !mongoose.Types.ObjectId.isValid(semesterId)) {
        throw new Error("Valid semesterId is required");
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
        throw new Error("Semester not found");
    }

    if (!["MID", "SEMESTER"].includes(timetableType)) {
        throw new Error("timetableType must be either 'MID' or 'SEMESTER'");
    }

    let normalizedMidExam = null;
    if (timetableType === "MID") {
        normalizedMidExam = normalizeMidExam(midExam);
        if (!normalizedMidExam) {
            throw new Error("Valid midExam ('MID-1', 'MID-2') is required for MID timetable");
        }
    } else if (timetableType === "SEMESTER") {
        normalizedMidExam = null;
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
        throw new Error("Branch not found");
    }

    // Check for existing timetable to replace without creating uncontrolled duplicates
    const existing = await Timetable.findOne({
        branchId,
        semesterId,
        year,
        timetableType,
        midExam: normalizedMidExam
    });

    if (existing) {
        // If existing record has a GridFS file in the cluster, remove it
        if (existing.file?.gridFsId) {
            try {
                const bucket = getTimetableBucket();
                await bucket.delete(new mongoose.Types.ObjectId(existing.file.gridFsId));
            } catch (err) {}
        }
        // If existing record was a legacy local file, clean up disk
        if (existing.file?.path && fs.existsSync(existing.file.path)) {
            try {
                fs.unlinkSync(existing.file.path);
            } catch (err) {}
        }
    }

    // Prepare buffer for MongoDB cluster GridFS storage
    let fileBuffer = file.buffer;
    if (!fileBuffer && file.path && fs.existsSync(file.path)) {
        fileBuffer = fs.readFileSync(file.path);
    }
    if (!fileBuffer) {
        throw new Error("Timetable file content buffer is missing");
    }

    const sanitizedOriginal = (file.originalname || "timetable.pdf").replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(sanitizedOriginal).toLowerCase() || ".pdf";
    const storedFilename = file.filename || `timetable-${uniqueSuffix}${ext}`;
    const mimeType = file.mimetype || (ext === ".pdf" ? "application/pdf" : "image/jpeg");

    // Exact cluster storage URI / path isolated per branch and semester
    const branchCode = branch.code || branch.name || branchId.toString();
    const semesterCode = semester.semesterCode || `Sem-${semester.semesterNumber}` || semesterId.toString();
    const clusterPath = `mongodb+srv://cluster0.nfitlvs.mongodb.net/academic_management/timetables/${branchCode}/${semesterCode}/${storedFilename}`;

    const metadata = {
        branchId,
        branchCode,
        semesterId,
        semesterCode,
        year,
        timetableType,
        midExam: normalizedMidExam,
        uploadedBy: user._id,
        uploadedByUsername: user.username,
        uploadedByRole: user.role,
        originalName: file.originalname || sanitizedOriginal,
        mimeType,
        size: file.size || fileBuffer.length,
        clusterPath
    };

    // Save directly into MongoDB Atlas Cluster GridFS bucket
    const gridFsId = await uploadBufferToGridFS(fileBuffer, storedFilename, metadata);

    const fileMeta = {
        filename: storedFilename,
        originalName: file.originalname || sanitizedOriginal,
        mimeType,
        size: file.size || fileBuffer.length,
        storage: "GRIDFS",
        gridFsId,
        clusterPath,
        path: clusterPath
    };

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
    if (!tt) return null;
    const doc = tt.toObject ? tt.toObject() : { ...tt };
    if (doc.file) {
        doc.fileUrl = `/api/timetables/${doc._id}/download`;
        doc.fileName = doc.file.originalName;
        doc.fileType = (doc.file.mimeType && doc.file.mimeType.includes("pdf")) ? "pdf" : "image";
        doc.clusterPath = doc.file.clusterPath || doc.file.path;
        doc.storage = doc.file.storage || (doc.file.gridFsId ? "GRIDFS" : "LOCAL");
    }
    doc.uploadedAt = doc.createdAt;
    return doc;
};

const getBranchTimetables = async (filter = {}, user = null) => {
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
    if (filter.timetableType) query.timetableType = filter.timetableType;
    if (filter.midExam) query.midExam = normalizeMidExam(filter.midExam) || filter.midExam;
    if (filter.year) query.year = parseInt(filter.year, 10);

    const timetables = await Timetable.find(query)
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .populate("uploadedBy", "username role")
        .sort({ year: -1, createdAt: -1 });

    return timetables.map(formatTimetable);
};

const getMyTimetable = async (user) => {
    if (!user || user.role !== "STUDENT") {
        throw new Error("Forbidden: Access restricted to student role");
    }

    const student = await Student.findOne({ rollNo: user.username });
    if (!student) {
        throw new Error("Student record not found");
    }

    const timetables = await Timetable.find({
        branchId: student.branchId,
        semesterId: student.semesterId,
        year: student.year
    })
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year")
        .sort({ timetableType: 1, midExam: 1 });

    return {
        student: {
            rollNo: student.rollNo,
            name: student.name,
            year: student.year
        },
        timetables: timetables.map(formatTimetable)
    };
};

const getTimetableById = async (id, user = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid timetable ID");
    }

    const timetable = await Timetable.findById(id)
        .populate("branchId", "name code")
        .populate("semesterId", "semesterCode year");

    if (!timetable) {
        return null;
    }

    if (user) {
        if (user.role === "CTPO") {
            if (
                !user.scopeRef ||
                user.scopeRef.type !== "BRANCH" ||
                timetable.branchId._id.toString() !== user.scopeRef.refId.toString()
            ) {
                throw new Error("Forbidden: Access denied outside your branch scope");
            }
        } else if (user.role === "STUDENT") {
            const student = await Student.findOne({ rollNo: user.username });
            if (!student || student.branchId.toString() !== timetable.branchId._id.toString()) {
                throw new Error("Forbidden: Access denied to other branch timetables");
            }
        }
    }

    return formatTimetable(timetable);
};

const deleteTimetable = async (id, user = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid timetable ID");
    }

    const timetable = await Timetable.findById(id);
    if (!timetable) {
        return null;
    }

    if (user && user.role === "CTPO") {
        if (
            !user.scopeRef ||
            user.scopeRef.type !== "BRANCH" ||
            timetable.branchId.toString() !== user.scopeRef.refId.toString()
        ) {
            throw new Error("Forbidden: CTPO can delete timetables only for assigned branch");
        }
    }

    // Delete from MongoDB Atlas Cluster GridFS if stored in cluster
    if (timetable.file?.gridFsId) {
        try {
            const bucket = getTimetableBucket();
            await bucket.delete(new mongoose.Types.ObjectId(timetable.file.gridFsId));
        } catch (err) {}
    }

    // Delete legacy local disk file if present
    if (timetable.file?.path && fs.existsSync(timetable.file.path)) {
        try {
            fs.unlinkSync(timetable.file.path);
        } catch (err) {}
    }

    return await Timetable.findByIdAndDelete(id);
};

module.exports = {
    getTimetableBucket,
    uploadTimetable,
    getBranchTimetables,
    getMyTimetable,
    getTimetableById,
    deleteTimetable
};
