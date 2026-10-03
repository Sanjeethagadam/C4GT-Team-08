const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semester.controller');
const { semesterValidator } = require('../validators/semester.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(semesterController.getSemesters)
  .post(requireRole('ADMIN'), semesterValidator, semesterController.createSemester);

router.route('/:id')
  .patch(requireRole('ADMIN'), semesterController.updateSemester);

module.exports = router;
