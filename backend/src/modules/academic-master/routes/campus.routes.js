const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campus.controller');
const { campusValidator } = require('../validators/campus.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(campusController.getCampuses)
  .post(requireRole('ADMIN'), campusValidator, campusController.createCampus);

router.route('/:id')
  .patch(requireRole('ADMIN'), campusValidator, campusController.updateCampus)
  .delete(requireRole('ADMIN'), campusController.deleteCampus);

module.exports = router;
