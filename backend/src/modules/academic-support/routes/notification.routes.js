const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification management API
 */

const notificationController = require('../controllers/notification.controller');
const { notificationValidation } = require('../validators/notification.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN', 'COORDINATOR'), notificationValidation, notificationController.create);
/**
 * @swagger
 * /api/v1/academic-support/notifications:
 *   get:
 *     summary: Get all Notifications
 *     tags: [Notification]
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
router.get('/', auth, notificationController.getAll);
/**
 * @swagger
 * /api/v1/academic-support/notifications/{id}:
 *   get:
 *     summary: Get Notification by ID
 *     tags: [Notification]
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
router.get('/:id', auth, notificationController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), notificationValidation, notificationController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), notificationController.remove);

module.exports = router;
