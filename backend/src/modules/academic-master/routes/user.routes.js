const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { body } = require('express-validator');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

const userValidator = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'COORDINATOR', 'ADMIN']).withMessage('Invalid role'),
];

router.use(protect);

router.route('/')
  .get(requireRole('ADMIN'), userController.getUsers)
  .post(requireRole('ADMIN'), userValidator, userController.createUser);

router.route('/:id')
  .patch(requireRole('ADMIN'), userController.updateUser)
  .delete(requireRole('ADMIN'), userController.deleteUser);

module.exports = router;
