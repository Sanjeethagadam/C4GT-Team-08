const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branch.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/", requireRole("ADMIN"), branchController.createBranch);
router.get("/", branchController.getAllBranches);
router.get("/:id", branchController.getBranchById);
router.patch("/:id", requireRole("ADMIN"), branchController.updateBranch);
router.delete("/:id", requireRole("ADMIN"), branchController.deleteBranch);

module.exports = router;