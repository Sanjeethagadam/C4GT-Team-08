const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semester.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/", requireRole("ADMIN"), semesterController.createSemester);
router.get("/", semesterController.getAllSemesters);
router.get("/:id", semesterController.getSemesterById);
router.patch("/:id", requireRole("ADMIN"), semesterController.updateSemester);
router.delete("/:id", requireRole("ADMIN"), semesterController.deleteSemester);

module.exports = router;