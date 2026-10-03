const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller');
const { protect } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/rbac.middleware');
const upload = require('../../../middlewares/upload.middleware');

router.use(protect);

router.post('/', requireRole('CTPO', 'ADMIN', 'PRINCIPAL'), upload.single('pdf'), noticeController.uploadNotice);
router.get('/', noticeController.getNotices);
router.put('/:id/publish', requireRole('CTPO', 'ADMIN', 'PRINCIPAL'), noticeController.publishNotice);
router.put('/:id/unpublish', requireRole('CTPO', 'ADMIN', 'PRINCIPAL'), noticeController.unpublishNotice);
router.delete('/:id', requireRole('CTPO', 'ADMIN', 'PRINCIPAL'), noticeController.deleteNotice);
router.get('/:id/stats', requireRole('CTPO', 'ADMIN', 'PRINCIPAL'), noticeController.getNoticeStats);
router.get('/:id/download', noticeController.downloadNotice);

module.exports = router;
