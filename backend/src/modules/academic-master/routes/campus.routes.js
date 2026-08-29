const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Campus
 *   description: Campus management API
 */

const campusController = require('../controllers/campus.controller');
const { campusValidation } = require('../validators/campus.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

/**
 * @swagger
 * /api/v1/academic-master/campuses:
 *   post:
 *     summary: Create Campus
 *     tags: [Campus]
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
 *               location:
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
router.post('/', auth, authorizeRoles('ADMIN'), campusValidation, campusController.create);
/**
 * @swagger
 * /api/v1/academic-master/campuses:
 *   get:
 *     summary: Get all Campuses
 *     tags: [Campus]
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
router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), campusController.getAll);
/**
 * @swagger
 * /api/v1/academic-master/campuses/{id}:
 *   get:
 *     summary: Get Campus by ID
 *     tags: [Campus]
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
router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'), campusController.getById);
/**
 * @swagger
 * /api/v1/academic-master/campuses/{id}:
 *   put:
 *     summary: Update Campus by ID
 *     tags: [Campus]
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
 *               location:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), campusValidation, campusController.update);
/**
 * @swagger
 * /api/v1/academic-master/campuses/{id}:
 *   delete:
 *     summary: Delete Campus by ID
 *     tags: [Campus]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), campusController.remove);

module.exports = router;
