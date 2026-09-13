const express = require("express");

const router = express.Router();

const {
    getRiskProfiles,
    calculateRisk
} = require("../controllers/riskProfileController");


// Get all risk profiles
router.get("/", getRiskProfiles);


// Calculate risk for a specific student
router.post(
    "/calculate/:studentId",
    calculateRisk
);


module.exports = router;