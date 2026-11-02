const express = require('express');
const { authController } = require('../controllers');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', optionalAuth, (req, res, next) =>
  req.user ? authController.getMe(req, res, next) : res.status(401).json({ message: '未登录' })
);

module.exports = router;
