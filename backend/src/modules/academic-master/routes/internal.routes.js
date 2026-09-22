const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect } = require('../../../middlewares/auth.middleware');

router.use(protect);

router.get('/students/:id', studentController.getInternalStudentById);

module.exports = router;
