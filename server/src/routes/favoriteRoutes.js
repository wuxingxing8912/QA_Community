const express = require('express');
const { favoriteController } = require('../controllers');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, favoriteController.toggle);
router.get('/', auth, favoriteController.list);
router.get('/status', auth, favoriteController.status);

module.exports = router;
