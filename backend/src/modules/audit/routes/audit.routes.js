const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Audit Logs management API
 */

const auditController = require('../controllers/audit.controller');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/audit-logs:
 *   get:
 *     summary: Get Audit Logs
 *     tags: [Audit Logs]
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
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL'), auditController.getLogs);

module.exports = router;
