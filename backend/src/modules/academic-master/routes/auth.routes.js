const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validator');
const { protect } = require('../../../middlewares/auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'));
    }
  }
});

router.post('/login', loginValidator, authController.login);
router.post('/register', authController.register);
router.post('/logout', protect, authController.logout);

router.get('/me', protect, authController.getMe);
router.get('/avatar/:fileId', protect, authController.getAvatar);

router.put('/profile', protect, upload.single('avatar'), authController.updateProfile);

module.exports = router;
