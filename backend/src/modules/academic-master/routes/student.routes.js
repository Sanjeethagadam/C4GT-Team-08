const express = require("express");
const {
    createStudent,
    createStudents,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
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

router.get("/", enforceScope, getAllStudents);
router.get("/:id", getStudentById);

router.patch("/:id", requireRole("ADMIN", "CTPO"), updateStudent);
router.delete("/:id", requireRole("ADMIN"), deleteStudent);

module.exports = router;