const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/campusBranchAvailability.controller');
const { availabilityValidator } = require('../validators/campusBranchAvailability.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(availabilityController.getAvailabilities)
  .post(requireRole('ADMIN'), availabilityValidator, availabilityController.createAvailability);

router.route('/:id')
  .patch(requireRole('ADMIN'), availabilityController.updateAvailability);

module.exports = router;
