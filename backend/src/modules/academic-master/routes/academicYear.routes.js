const express = require("express");
const router = express.Router();
const academicYearController = require("../controllers/academicYear.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/", requireRole("ADMIN"), academicYearController.createAcademicYear);
router.get("/", academicYearController.getAllAcademicYears);
router.get("/:id", academicYearController.getAcademicYearById);
router.patch("/:id", requireRole("ADMIN"), academicYearController.updateAcademicYear);
router.delete("/:id", requireRole("ADMIN"), academicYearController.deleteAcademicYear);

module.exports = router;