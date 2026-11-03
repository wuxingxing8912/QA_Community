const { userModel } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { toPublicUser } = require('./authController');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const users = await userModel.findList({ limit });
  res.json({ list: users.map(toPublicUser) });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  res.json({ user: toPublicUser(user) });
});

module.exports = { list, getProfile };
