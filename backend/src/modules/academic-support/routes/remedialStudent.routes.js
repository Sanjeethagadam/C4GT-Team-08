const express = require('express');
const router = express.Router();
const remedialStudentController = require('../controllers/remedialStudent.controller');
const { remedialStudentValidation } = require('../validators/remedialStudent.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN', 'COORDINATOR'), remedialStudentValidation, remedialStudentController.create);
router.get('/', auth, remedialStudentController.getAll);
router.get('/:id', auth, remedialStudentController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), remedialStudentValidation, remedialStudentController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), remedialStudentController.remove);

module.exports = router;
