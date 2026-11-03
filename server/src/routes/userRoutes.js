const express = require('express');
const { userController } = require('../controllers');

const router = express.Router();

router.get('/', userController.list);
router.get('/:id', userController.getProfile);

module.exports = router;
