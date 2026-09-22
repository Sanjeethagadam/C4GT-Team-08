const express = require('express');
const router = express.Router();
const notificationRoutes = require('./notification.routes');
const noticeRoutes = require('./notice.routes');

router.use('/notices', noticeRoutes);
router.use('/', notificationRoutes);

module.exports = router;
