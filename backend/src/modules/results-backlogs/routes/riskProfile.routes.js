const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Risk
 *   description: Risk management API
 */

const riskProfileController = require('../controllers/riskProfile.controller');
const { riskProfileValidation } = require('../validators/riskProfile.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), riskProfileValidation, riskProfileController.create);
/**
 * @swagger
 * /api/v1/results-backlogs/risk:
 *   get:
 *     summary: Get all Risk Profiles
 *     tags: [Risk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       201:
 *         description: Created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: 'Forbidden (Requires roles: )'
 *       404:
 *         description: Not found
 */
router.get('/', auth, riskProfileController.getAll);
router.get('/:id', auth, riskProfileController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), riskProfileValidation, riskProfileController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), riskProfileController.remove);

module.exports = router;
