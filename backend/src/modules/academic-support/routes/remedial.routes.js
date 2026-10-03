const express = require('express');
const router = express.Router();
const remedialController = require('../controllers/remedial.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');
const { remedialValidator } = require('../validators/academicSupport.validator');
const { validateRequest } = require('../../../middlewares/validate.middleware');

router.use(protect);
// Coordinator manages these, others might just read (but currently only COORDINATOR manages)
router.get('/eligible-students', requireRole('COORDINATOR', 'ADMIN'), remedialController.getEligibleStudents);
router.get('/student', requireRole('STUDENT'), remedialController.getForStudent);
router.get('/', requireRole('COORDINATOR', 'HOD', 'PRINCIPAL', 'ADMIN', 'STUDENT'), remedialController.getAll);
router.post('/', requireRole('COORDINATOR', 'ADMIN'), remedialValidator, validateRequest, remedialController.create);
router.put('/:id', requireRole('COORDINATOR', 'ADMIN'), remedialValidator, validateRequest, remedialController.update);
router.delete('/:id', requireRole('COORDINATOR', 'ADMIN'), remedialController.delete);

module.exports = router;
