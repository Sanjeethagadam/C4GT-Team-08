const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RemedialClass
 *   description: RemedialClass management API
 */

const remedialClassController = require('../controllers/remedialClass.controller');
const { remedialClassValidation } = require('../validators/remedialClass.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/academic-support/remedial-classes:
 *   post:
 *     summary: Create Remedial Class
 *     tags: [RemedialClass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *               campusId:
 *                 type: string
 *               branchId:
 *                 type: string
 *               coordinatorId:
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
router.post('/', auth, authorizeRoles('ADMIN', 'COORDINATOR'), remedialClassValidation, remedialClassController.create);
/**
 * @swagger
 * /api/v1/academic-support/remedial-classes:
 *   get:
 *     summary: Get all Remedial Classes
 *     tags: [RemedialClass]
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
router.get('/', auth, remedialClassController.getAll);
/**
 * @swagger
 * /api/v1/academic-support/remedial-classes/{id}:
 *   get:
 *     summary: Get Remedial Class by ID
 *     tags: [RemedialClass]
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
router.get('/:id', auth, remedialClassController.getById);
/**
 * @swagger
 * /api/v1/academic-support/remedial-classes/{id}:
 *   put:
 *     summary: Update Remedial Class by ID
 *     tags: [RemedialClass]
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
 *               schedule:
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
router.put('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), remedialClassValidation, remedialClassController.update);
/**
 * @swagger
 * /api/v1/academic-support/remedial-classes/{id}:
 *   delete:
 *     summary: Delete Remedial Class by ID
 *     tags: [RemedialClass]
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
router.delete('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), remedialClassController.remove);

module.exports = router;
