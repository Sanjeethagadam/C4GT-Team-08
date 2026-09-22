const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { body } = require('express-validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

const branchValidator = [
  body('name').notEmpty().withMessage('Branch name is required'),
  body('code').notEmpty().withMessage('Branch code is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

router.use(protect);

router.route('/')
  .get(branchController.getBranches)
  .post(requireRole('ADMIN'), branchValidator, branchController.createBranch);

router.route('/:id')
  .patch(requireRole('ADMIN'), branchValidator, branchController.updateBranch)
  .delete(requireRole('ADMIN'), branchController.deleteBranch);

module.exports = router;
