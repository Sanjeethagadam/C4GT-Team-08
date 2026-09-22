const express = require('express');
const router = express.Router();
const multer = require('multer');
const semesterResultController = require('../controllers/semesterResult.controller');

const { protect } = require('../../../middlewares/auth.middleware');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'scratch/uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/upload-preview', protect, upload.single('file'), semesterResultController.uploadAndPreview);
router.post('/confirm-import', protect, semesterResultController.confirmAndImport);
router.get('/', protect, semesterResultController.getResults);

module.exports = router;
