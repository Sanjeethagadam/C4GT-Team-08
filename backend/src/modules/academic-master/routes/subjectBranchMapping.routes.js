const express = require('express');
const router = express.Router();
const mappingController = require('../controllers/subjectBranchMapping.controller');
const { mappingValidator } = require('../validators/subjectBranchMapping.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(mappingController.getMappings)
  .post(requireRole('ADMIN'), mappingValidator, mappingController.createMapping);

router.route('/:id')
  .patch(requireRole('ADMIN'), mappingController.updateMapping)
  .delete(requireRole('ADMIN'), mappingController.deleteMapping);

module.exports = router;
