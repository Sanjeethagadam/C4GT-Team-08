const express = require("express");
const router = express.Router();
const controller = require("../controllers/campusBranchAvailability.controller");
const { authenticate, requireRole } = require("../../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/", requireRole("ADMIN"), controller.createAvailability);
router.get("/", controller.getAllAvailability);
router.get("/:id", controller.getAvailabilityById);
router.patch("/:id", requireRole("ADMIN"), controller.updateAvailability);
router.delete("/:id", requireRole("ADMIN"), controller.deleteAvailability);

module.exports = router;