const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { userValidation } = require('../validators/user.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), userValidation, userController.create);
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), userController.getAll);
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), userController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), userValidation, userController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), userController.remove);

module.exports = router;
