const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Backlog
 *   description: Backlog management API
 */

const backlogController = require('../controllers/backlog.controller');
const { backlogValidation } = require('../validators/backlog.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), backlogValidation, backlogController.create);
/**
 * @swagger
 * /api/v1/results-backlogs/backlogs:
 *   get:
 *     summary: Get all Backlogs
 *     tags: [Backlog]
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
router.get('/', auth, backlogController.getAll);
/**
 * @swagger
 * /api/v1/results-backlogs/backlogs/{id}:
 *   get:
 *     summary: Get Backlog by ID
 *     tags: [Backlog]
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
router.get('/:id', auth, backlogController.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), backlogValidation, backlogController.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), backlogController.remove);

module.exports = router;
