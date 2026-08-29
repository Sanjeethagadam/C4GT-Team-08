const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Examination
 *   description: Examination management API
 */

const examinationController = require('../controllers/examination.controller');
const { examinationValidation } = require('../validators/examination.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/examination/examinations:
 *   post:
 *     summary: Create Examination
 *     tags: [Examination]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               semesterId:
 *                 type: string
 *               examinationType:
 *                 type: string
 *               status:
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
router.post('/', auth, authorizeRoles('ADMIN'), examinationValidation, examinationController.create);
/**
 * @swagger
 * /api/v1/examination/examinations:
 *   get:
 *     summary: Get all Examinations
 *     tags: [Examination]
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
router.get('/', auth, examinationController.getAll);
/**
 * @swagger
 * /api/v1/examination/examinations/{id}:
 *   get:
 *     summary: Get Examination by ID
 *     tags: [Examination]
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
router.get('/:id', auth, examinationController.getById);
/**
 * @swagger
 * /api/v1/examination/examinations/{id}:
 *   put:
 *     summary: Update Examination by ID
 *     tags: [Examination]
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
 *               status:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), examinationValidation, examinationController.update);
/**
 * @swagger
 * /api/v1/examination/examinations/{id}:
 *   delete:
 *     summary: Delete Examination by ID
 *     tags: [Examination]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), examinationController.remove);

module.exports = router;
