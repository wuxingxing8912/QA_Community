const express = require('express');
const { questionController } = require('../controllers');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', questionController.list);
router.get('/:id', questionController.detail);
router.post('/', auth, questionController.create);
router.put('/:id', auth, questionController.update);
router.delete('/:id', auth, questionController.remove);

module.exports = router;
