const express = require("express");
const router = express.Router();
const campusController = require("../controllers/campus.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/", requireRole("ADMIN"), campusController.createCampus);
router.get("/", campusController.getAllCampuses);
router.get("/:id", campusController.getCampusById);
router.patch("/:id", requireRole("ADMIN"), campusController.updateCampus);
router.delete("/:id", requireRole("ADMIN"), campusController.deleteCampus);

module.exports = router;