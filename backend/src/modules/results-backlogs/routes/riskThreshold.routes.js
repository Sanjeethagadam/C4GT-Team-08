const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RiskThreshold
 *   description: RiskThreshold management API
 */

const riskThresholdController = require('../controllers/riskThreshold.controller');
const { riskThresholdValidation } = require('../validators/riskThreshold.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/results-backlogs/risk-thresholds:
 *   post:
 *     summary: Create Risk Threshold
 *     tags: [RiskThreshold]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *               condition:
 *                 type: string
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
router.post('/', auth, authorizeRoles('ADMIN'), riskThresholdValidation, riskThresholdController.create);
/**
 * @swagger
 * /api/v1/results-backlogs/risk-thresholds:
 *   get:
 *     summary: Get all Risk Thresholds
 *     tags: [RiskThreshold]
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
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL'), riskThresholdController.getAll);
/**
 * @swagger
 * /api/v1/results-backlogs/risk-thresholds/{id}:
 *   get:
 *     summary: Get Risk Threshold by ID
 *     tags: [RiskThreshold]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL'), riskThresholdController.getById);
/**
 * @swagger
 * /api/v1/results-backlogs/risk-thresholds/{id}:
 *   put:
 *     summary: Update Risk Threshold by ID
 *     tags: [RiskThreshold]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               condition:
 *                 type: string
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
router.put('/:id', auth, authorizeRoles('ADMIN'), riskThresholdValidation, riskThresholdController.update);
/**
 * @swagger
 * /api/v1/results-backlogs/risk-thresholds/{id}:
 *   delete:
 *     summary: Delete Risk Threshold by ID
 *     tags: [RiskThreshold]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), riskThresholdController.remove);

module.exports = router;
