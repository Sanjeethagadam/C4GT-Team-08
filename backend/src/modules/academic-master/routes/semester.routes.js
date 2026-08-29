const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Semester
 *   description: Semester management API
 */

const semesterController = require('../controllers/semester.controller');
const { semesterValidation } = require('../validators/semester.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/academic-master/semesters:
 *   post:
 *     summary: Create Semester
 *     tags: [Semester]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
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
router.post('/', auth, authorizeRoles('ADMIN'), semesterValidation, semesterController.create);
/**
 * @swagger
 * /api/v1/academic-master/semesters:
 *   get:
 *     summary: Get all Semesters
 *     tags: [Semester]
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
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), semesterController.getAll);
/**
 * @swagger
 * /api/v1/academic-master/semesters/{id}:
 *   get:
 *     summary: Get Semester by ID
 *     tags: [Semester]
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
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), semesterController.getById);
/**
 * @swagger
 * /api/v1/academic-master/semesters/{id}:
 *   put:
 *     summary: Update Semester by ID
 *     tags: [Semester]
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
 *               name:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), semesterValidation, semesterController.update);
/**
 * @swagger
 * /api/v1/academic-master/semesters/{id}:
 *   delete:
 *     summary: Delete Semester by ID
 *     tags: [Semester]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), semesterController.remove);

module.exports = router;
