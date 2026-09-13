const express = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const { authenticate } = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getDashboard);

module.exports = router;
