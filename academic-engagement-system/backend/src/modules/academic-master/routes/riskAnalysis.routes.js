const express = require("express");
const router = express.Router();
const riskAnalysisController = require("../controllers/riskAnalysis.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

// Get Risk Analysis for branch (for CTPO, branch is inferred from user.scopeRef; for Admin/HOD/Principal branchId can be in query)
router.get(
    "/",
    authenticate,
    requireRole("ADMIN", "CTPO", "HOD", "PRINCIPAL"),
    riskAnalysisController.getBranchRiskAnalysis
);

module.exports = router;
