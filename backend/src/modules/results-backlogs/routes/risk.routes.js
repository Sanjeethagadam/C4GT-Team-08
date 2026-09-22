const express = require('express');
const router = express.Router();
const riskController = require('../controllers/risk.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');

router.get('/', protect, requireRole('CTPO', 'HOD', 'PRINCIPAL', 'ADMIN'), riskController.getRiskProfiles);

// Config endpoints for ADMIN
router.get('/config', protect, requireRole('ADMIN'), riskController.getConfig);
router.post('/config', protect, requireRole('ADMIN'), riskController.updateConfig);

module.exports = router;
