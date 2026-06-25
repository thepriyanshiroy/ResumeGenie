const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.post("/logout", authController.logout);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.get('/logout', authController.logout);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authMiddleware.protect, authController.updatePassword);

module.exports = router;