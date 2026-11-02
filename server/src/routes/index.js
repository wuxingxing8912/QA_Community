const express = require('express');
const { testConnection } = require('../config/db');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const questionRoutes = require('./questionRoutes');
const answerRoutes = require('./answerRoutes');
const voteRoutes = require('./voteRoutes');

const router = express.Router();

router.get('/health', async (req, res) => {
  const dbConnected = await testConnection().then(() => true).catch(() => false);
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'db_unavailable',
    db: dbConnected,
    time: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
router.use('/votes', voteRoutes);

module.exports = router;
