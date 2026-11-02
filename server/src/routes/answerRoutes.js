const express = require('express');
const { answerController } = require('../controllers');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, answerController.create);
router.put('/:id/accept', auth, answerController.accept);

module.exports = router;
