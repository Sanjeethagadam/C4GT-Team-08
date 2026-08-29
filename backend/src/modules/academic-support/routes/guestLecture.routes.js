const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GuestLecture
 *   description: GuestLecture management API
 */

const guestLectureController = require('../controllers/guestLecture.controller');
const { guestLectureValidation } = require('../validators/guestLecture.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/academic-support/guest-lectures:
 *   post:
 *     summary: Create Guest Lecture
 *     tags: [GuestLecture]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lecturerName:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               campusId:
 *                 type: string
 *               branchId:
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
router.post('/', auth, authorizeRoles('ADMIN', 'COORDINATOR'), guestLectureValidation, guestLectureController.create);
/**
 * @swagger
 * /api/v1/academic-support/guest-lectures:
 *   get:
 *     summary: Get all Guest Lectures
 *     tags: [GuestLecture]
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
router.get('/', auth, guestLectureController.getAll);
/**
 * @swagger
 * /api/v1/academic-support/guest-lectures/{id}:
 *   get:
 *     summary: Get Guest Lecture by ID
 *     tags: [GuestLecture]
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
router.get('/:id', auth, guestLectureController.getById);
/**
 * @swagger
 * /api/v1/academic-support/guest-lectures/{id}:
 *   put:
 *     summary: Update Guest Lecture by ID
 *     tags: [GuestLecture]
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
router.put('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), guestLectureValidation, guestLectureController.update);
/**
 * @swagger
 * /api/v1/academic-support/guest-lectures/{id}:
 *   delete:
 *     summary: Delete Guest Lecture by ID
 *     tags: [GuestLecture]
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
router.delete('/:id', auth, authorizeRoles('ADMIN', 'COORDINATOR'), guestLectureController.remove);

module.exports = router;
