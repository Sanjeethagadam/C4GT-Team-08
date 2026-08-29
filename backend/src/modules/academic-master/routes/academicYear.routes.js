const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYear.controller');
const { academicYearValidation } = require('../validators/academicYear.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), academicYearValidation, academicYearController.create);
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), academicYearController.getAll);
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), academicYearController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), academicYearValidation, academicYearController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), academicYearController.remove);

module.exports = router;
