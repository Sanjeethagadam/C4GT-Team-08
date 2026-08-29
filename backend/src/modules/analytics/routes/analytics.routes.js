const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics management API
 */

const analyticsController = require('../controllers/analytics.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * /api/v1/analytics/academic:
 *   get:
 *     summary: Get Academic Trends
 *     tags: [Analytics]
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
router.get('/academic', auth, analyticsController.getAcademicTrends);
/**
 * @swagger
 * /api/v1/analytics/results:
 *   get:
 *     summary: Get Results Distribution
 *     tags: [Analytics]
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
router.get('/results', auth, analyticsController.getResultsDistribution);
/**
 * @swagger
 * /api/v1/analytics/backlogs:
 *   get:
 *     summary: Get Backlogs Distribution
 *     tags: [Analytics]
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
router.get('/backlogs', auth, analyticsController.getBacklogsDistribution);
/**
 * @swagger
 * /api/v1/analytics/risk:
 *   get:
 *     summary: Get Risk Distribution
 *     tags: [Analytics]
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
router.get('/risk', auth, analyticsController.getRiskDistribution);
/**
 * @swagger
 * /api/v1/analytics/remedial:
 *   get:
 *     summary: Get Remedial Stats
 *     tags: [Analytics]
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
router.get('/remedial', auth, analyticsController.getRemedialStats);
/**
 * @swagger
 * /api/v1/analytics/guest-lectures:
 *   get:
 *     summary: Get Guest Lecture Stats
 *     tags: [Analytics]
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
router.get('/guest-lectures', auth, analyticsController.getGuestLectureStats);
/**
 * @swagger
 * /api/v1/analytics/campus:
 *   get:
 *     summary: Get Campus KPIs
 *     tags: [Analytics]
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
router.get('/campus', auth, analyticsController.getCampusKPIs);

module.exports = router;
