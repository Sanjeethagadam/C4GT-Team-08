const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const { subjectValidator } = require('../validators/subject.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.route('/')
  .get(subjectController.getSubjects)
  .post(requireRole('ADMIN'), subjectValidator, subjectController.createSubject);

router.route('/:id')
  .patch(requireRole('ADMIN'), subjectController.updateSubject)
  .delete(requireRole('ADMIN'), subjectController.deleteSubject);

module.exports = router;
