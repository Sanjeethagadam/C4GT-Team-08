const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetable.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");
const { uploadTimetableFile } = require("../../../middlewares/upload.middleware");

// Student self timetable
router.get(
    "/my-timetable",
    authenticate,
    requireRole("STUDENT"),
    timetableController.getMyTimetable
);

// Branch timetables
router.get(
    "/branch",
    authenticate,
    requireRole("ADMIN", "CTPO", "HOD", "PRINCIPAL"),
    timetableController.getBranchTimetables
);

// Controlled file download/streaming
router.get(
    "/:id/download",
    authenticate,
    timetableController.downloadTimetableFile
);

// Timetable by ID
router.get(
    "/:id",
    authenticate,
    timetableController.getTimetableById
);

// Upload timetable (file field name: "file")
router.post(
    "/upload",
    authenticate,
    requireRole("ADMIN", "CTPO"),
    uploadTimetableFile.single("file"),
    timetableController.uploadTimetable
);

// Delete timetable
router.delete(
    "/:id",
    authenticate,
    requireRole("ADMIN", "CTPO"),
    timetableController.deleteTimetable
);

module.exports = router;
