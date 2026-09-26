const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYear.controller');
const { academicYearValidator } = require('../validators/academicYear.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(academicYearController.getAcademicYears)
  .post(requireRole('ADMIN'), academicYearValidator, academicYearController.createAcademicYear);

router.route('/:id')
  .patch(requireRole('ADMIN'), academicYearController.updateAcademicYear)
  .delete(requireRole('ADMIN'), academicYearController.deleteAcademicYear);

module.exports = router;
