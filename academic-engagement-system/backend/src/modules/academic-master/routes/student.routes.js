const express = require("express");
const {
    createStudent,
    createStudents,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyProfile,
    getMyBacklogs
} = require("../controllers/student.controller");
const {
    authenticate,
    requireRole,
    enforceScope
} = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", requireRole("ADMIN", "CTPO"), createStudent);
router.post("/bulk", requireRole("ADMIN", "CTPO"), createStudents);

router.get("/profile/me", requireRole("STUDENT"), getMyProfile);
router.get("/me", requireRole("STUDENT"), getMyProfile);
router.get("/my-backlogs", requireRole("STUDENT"), getMyBacklogs);
router.get("/backlogs", requireRole("STUDENT"), getMyBacklogs);

router.get("/", enforceScope, getAllStudents);
router.get("/:id", getStudentById);

router.patch("/:id", requireRole("ADMIN", "CTPO"), updateStudent);
router.delete("/:id", requireRole("ADMIN", "CTPO"), deleteStudent);

module.exports = router;