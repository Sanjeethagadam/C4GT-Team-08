const express = require("express");
const {
    createSubject,
    createSubjects,
    seedSubjectsFromPdf,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} = require("../controllers/subject.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", requireRole("ADMIN"), createSubject);
router.post("/bulk", requireRole("ADMIN"), createSubjects);
router.post("/seed", requireRole("ADMIN"), seedSubjectsFromPdf);

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);

router.patch("/:id", requireRole("ADMIN"), updateSubject);
router.delete("/:id", requireRole("ADMIN"), deleteSubject);

module.exports = router;