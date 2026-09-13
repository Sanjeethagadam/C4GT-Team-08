const express = require("express");
const router = express.Router();
const midMarkController = require("../controllers/midMark.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

// Student self mid marks (must be defined before :studentId / parameterized routes)
router.get(
    "/my-marks",
    authenticate,
    requireRole("STUDENT"),
    midMarkController.getMyMidMarks
);

// Branch mid marks
router.get(
    "/branch",
    authenticate,
    requireRole("ADMIN", "CTPO", "HOD", "PRINCIPAL"),
    midMarkController.getBranchMidMarks
);

// Student mid marks by ID (protected & role-scoped)
router.get(
    "/student/:studentId",
    authenticate,
    requireRole("ADMIN", "CTPO", "HOD", "PRINCIPAL", "STUDENT"),
    midMarkController.getStudentMidMarks
);

// Enter mid marks
router.post(
    "/",
    authenticate,
    requireRole("ADMIN", "CTPO"),
    midMarkController.enterMidMarks
);

// Update mid mark
router.patch(
    "/:id",
    authenticate,
    requireRole("ADMIN", "CTPO"),
    midMarkController.updateMidMark
);

router.put(
    "/:id",
    authenticate,
    requireRole("ADMIN", "CTPO"),
    midMarkController.updateMidMark
);

module.exports = router;
