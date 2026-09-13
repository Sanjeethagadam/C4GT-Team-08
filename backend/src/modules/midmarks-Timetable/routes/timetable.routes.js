const express = require("express");

const router = express.Router();

const timetableController = require("../controllers/timetable.controller");

const {
    authenticate,
    requireRole
} = require("../../../middlewares/auth.middleware");

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

// Timetable by ID
router.get(
    "/:id",
    authenticate,
    timetableController.getTimetableById
);

// Delete timetable
router.delete(
    "/:id",
    authenticate,
    requireRole("ADMIN", "CTPO"),
    timetableController.deleteTimetable
);

module.exports = router;