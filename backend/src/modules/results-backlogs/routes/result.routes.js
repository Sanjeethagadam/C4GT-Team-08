const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Result
 *   description: Result management API
 */

const resultController = require('../controllers/result.controller');
const importController = require('../controllers/import.controller');
const pdfImportController = require('../controllers/pdfImport.controller');
const { resultValidation } = require('../validators/result.validator');
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/v1/results-backlogs/results/import:
 *   post:
 *     summary: Import Results from CSV
 *     tags: [Result]
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
router.post('/import', auth, authorizeRoles('ADMIN', 'COORDINATOR'), upload.single('file'), importController.importResults);

/**
 * @swagger
 * /api/v1/results-backlogs/results/pdf/preview:
 *   post:
 *     summary: Preview Results from PDF
 *     tags: [Result]
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
router.post('/pdf/preview', auth, authorizeRoles('ADMIN', 'COORDINATOR'), upload.single('file'), pdfImportController.preview);
/**
 * @swagger
 * /api/v1/results-backlogs/results/pdf/confirm:
 *   post:
 *     summary: Confirm Results from PDF
 *     tags: [Result]
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
router.post('/pdf/confirm', auth, authorizeRoles('ADMIN', 'COORDINATOR'), pdfImportController.confirm);

/**
 * @swagger
 * /api/v1/results-backlogs/results:
 *   post:
 *     summary: Create Result manually
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               semesterId:
 *                 type: string
 *               resultStatus:
 *                 type: string
 *               grade:
 *                 type: string
 *               source:
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
router.post('/', auth, authorizeRoles('ADMIN'), resultValidation, resultController.create);
/**
 * @swagger
 * /api/v1/results-backlogs/results:
 *   get:
 *     summary: Get all Results
 *     tags: [Result]
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
router.get('/', auth, resultController.getAll);
/**
 * @swagger
 * /api/v1/results-backlogs/results/{id}:
 *   get:
 *     summary: Get Result by ID
 *     tags: [Result]
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
router.get('/:id', auth, resultController.getById);
/**
 * @swagger
 * /api/v1/results-backlogs/results/{id}:
 *   put:
 *     summary: Update Result by ID
 *     tags: [Result]
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
 *               resultStatus:
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
router.put('/:id', auth, authorizeRoles('ADMIN'), resultValidation, resultController.update);
/**
 * @swagger
 * /api/v1/results-backlogs/results/{id}:
 *   delete:
 *     summary: Delete Result by ID
 *     tags: [Result]
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
router.delete('/:id', auth, authorizeRoles('ADMIN'), resultController.remove);

module.exports = router;
