const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');
const { sectionValidator } = require('../validators/section.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(sectionController.getSections)
  .post(requireRole('ADMIN'), sectionValidator, sectionController.createSection);

router.route('/:id')
  .patch(requireRole('ADMIN'), sectionController.updateSection)
  .delete(requireRole('ADMIN'), sectionController.deleteSection);

module.exports = router;
