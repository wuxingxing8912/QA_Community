const express = require('express');
const { voteController } = require('../controllers');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, voteController.toggle);
router.get('/status', auth, voteController.status);

module.exports = router;
