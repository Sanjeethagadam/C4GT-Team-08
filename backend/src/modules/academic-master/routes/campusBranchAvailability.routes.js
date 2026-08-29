const express = require('express');
const router = express.Router();
const campusBranchAvailabilityController = require('../controllers/campusBranchAvailability.controller');
const { campusBranchAvailabilityValidation } = require('../validators/campusBranchAvailability.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), campusBranchAvailabilityValidation, campusBranchAvailabilityController.create);
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), campusBranchAvailabilityController.getAll);
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), campusBranchAvailabilityController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), campusBranchAvailabilityValidation, campusBranchAvailabilityController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), campusBranchAvailabilityController.remove);

module.exports = router;
