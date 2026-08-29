const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Timetable
 *   description: Timetable management API
 */

const timetableController = require('../controllers/timetable.controller');
const { timetableValidation } = require('../validators/timetable.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/examination/timetables:
 *   post:
 *     summary: Create Timetable
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               examinationId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               venue:
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
router.post('/', auth, authorizeRoles('ADMIN'), timetableValidation, timetableController.create);
/**
 * @swagger
 * /api/v1/examination/timetables:
 *   get:
 *     summary: Get all Timetables
 *     tags: [Timetable]
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
router.get('/', auth, timetableController.getAll);
/**
 * @swagger
 * /api/v1/examination/timetables/{id}:
 *   get:
 *     summary: Get Timetable by ID
 *     tags: [Timetable]
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
router.get('/:id', auth, timetableController.getById);
/**
 * @swagger
 * /api/v1/examination/timetables/{id}:
 *   put:
 *     summary: Update Timetable by ID
 *     tags: [Timetable]
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
 *               venue:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), timetableValidation, timetableController.update);
/**
 * @swagger
 * /api/v1/examination/timetables/{id}:
 *   delete:
 *     summary: Delete Timetable by ID
 *     tags: [Timetable]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), timetableController.remove);

module.exports = router;
