const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlog.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.use(protect);

router.get('/', requireRole('STUDENT', 'CTPO', 'HOD', 'PRINCIPAL', 'ADMIN'), backlogController.getBacklogs);
router.get('/students', requireRole('COORDINATOR', 'HOD', 'PRINCIPAL', 'ADMIN'), backlogController.getBacklogStudents);

module.exports = router;
