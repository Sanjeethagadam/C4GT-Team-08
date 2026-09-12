const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Use in-memory storage so uploaded files are streamed directly into MongoDB Atlas Cluster (GridFS)
// without ever touching or saving files into the local codebase or filesystem
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    ];
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only PDF, PNG, JPG, and JPEG timetable files are allowed."
            ),
            false
        );
    }
};

const uploadTimetableFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

module.exports = {
    uploadTimetableFile
};
