const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Branch
 *   description: Branch management API
 */

const branchController = require('../controllers/branch.controller');
const { branchValidation } = require('../validators/branch.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/academic-master/branches:
 *   post:
 *     summary: Create Branch
 *     tags: [Branch]
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
 *               campusId:
 *                 type: string
 *               headOfDepartmentId:
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
router.post('/', auth, authorizeRoles('ADMIN'), branchValidation, branchController.create);
/**
 * @swagger
 * /api/v1/academic-master/branches:
 *   get:
 *     summary: Get all Branches
 *     tags: [Branch]
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
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), branchController.getAll);
/**
 * @swagger
 * /api/v1/academic-master/branches/{id}:
 *   get:
 *     summary: Get Branch by ID
 *     tags: [Branch]
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
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), branchController.getById);
/**
 * @swagger
 * /api/v1/academic-master/branches/{id}:
 *   put:
 *     summary: Update Branch by ID
 *     tags: [Branch]
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
 *               headOfDepartmentId:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), branchValidation, branchController.update);
/**
 * @swagger
 * /api/v1/academic-master/branches/{id}:
 *   delete:
 *     summary: Delete Branch by ID
 *     tags: [Branch]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), branchController.remove);

module.exports = router;
