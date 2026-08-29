const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');
const { sectionValidation } = require('../validators/section.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), sectionValidation, sectionController.create);
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), sectionController.getAll);
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), sectionController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), sectionValidation, sectionController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), sectionController.remove);

module.exports = router;
