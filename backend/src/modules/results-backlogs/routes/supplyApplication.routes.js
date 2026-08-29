const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SupplyApplication
 *   description: SupplyApplication management API
 */

const supplyApplicationController = require('../controllers/supplyApplication.controller');
const { supplyApplicationValidation } = require('../validators/supplyApplication.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/results-backlogs/supply-applications:
 *   post:
 *     summary: Create Supply Application
 *     tags: [SupplyApplication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               backlogId:
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
router.post('/', auth, authorizeRoles('ADMIN'), supplyApplicationValidation, supplyApplicationController.create);
/**
 * @swagger
 * /api/v1/results-backlogs/supply-applications:
 *   get:
 *     summary: Get all Supply Applications
 *     tags: [SupplyApplication]
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
router.get('/', auth, supplyApplicationController.getAll);
/**
 * @swagger
 * /api/v1/results-backlogs/supply-applications/{id}:
 *   get:
 *     summary: Get Supply Application by ID
 *     tags: [SupplyApplication]
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
router.get('/:id', auth, supplyApplicationController.getById);
/**
 * @swagger
 * /api/v1/results-backlogs/supply-applications/{id}:
 *   put:
 *     summary: Update Supply Application by ID
 *     tags: [SupplyApplication]
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
 *               paymentStatus:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), supplyApplicationValidation, supplyApplicationController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), supplyApplicationController.remove);

module.exports = router;
