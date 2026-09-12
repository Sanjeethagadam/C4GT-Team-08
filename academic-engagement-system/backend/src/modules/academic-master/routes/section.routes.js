const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/section.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/", requireRole("ADMIN"), sectionController.createSection);
router.get("/", sectionController.getAllSections);
router.get("/:id", sectionController.getSectionById);
router.patch("/:id", requireRole("ADMIN"), sectionController.updateSection);
router.delete("/:id", requireRole("ADMIN"), sectionController.deleteSection);

module.exports = router;