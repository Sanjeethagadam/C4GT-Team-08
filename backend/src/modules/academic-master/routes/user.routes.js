const express = require("express");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    syncStudentUsers
} = require("../controllers/user.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.post("/sync-students", syncStudentUsers);

module.exports = router;