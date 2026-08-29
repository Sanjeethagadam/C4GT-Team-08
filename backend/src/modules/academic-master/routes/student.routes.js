const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student management API
 */

const studentController = require('../controllers/student.controller');
const { studentValidation } = require('../validators/student.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/academic-master/students:
 *   post:
 *     summary: Create Student
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               campusId:
 *                 type: string
 *               branchId:
 *                 type: string
 *               section:
 *                 type: string
 *               userId:
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
router.post('/', auth, authorizeRoles('ADMIN'), studentValidation, studentController.create);
/**
 * @swagger
 * /api/v1/academic-master/students:
 *   get:
 *     summary: Get all Students
 *     tags: [Student]
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
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO', 'COORDINATOR'), studentController.getAll);

/**
 * @swagger
 * /api/v1/academic-master/students/me:
 *   get:
 *     summary: Get Student profile for logged in user
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: 'Forbidden'
 *       404:
 *         description: Not found
 */
router.get('/me', auth, authorizeRoles('STUDENT'), studentController.getMe);

/**
 * @swagger
 * /api/v1/academic-master/students/{id}:
 *   get:
 *     summary: Get Student by ID
 *     tags: [Student]
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
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO', 'STUDENT', 'COORDINATOR'), studentController.getById);
/**
 * @swagger
 * /api/v1/academic-master/students/{id}:
 *   put:
 *     summary: Update Student by ID
 *     tags: [Student]
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
 *               section:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), studentValidation, studentController.update);
/**
 * @swagger
 * /api/v1/academic-master/students/{id}:
 *   delete:
 *     summary: Delete Student by ID
 *     tags: [Student]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), studentController.remove);

module.exports = router;
