const express = require("express");
const { getInternalStudentById } = require("../controllers/internal.controller");
const { authenticate } = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.get("/students/:id", getInternalStudentById);

module.exports = router;
