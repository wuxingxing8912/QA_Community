const { favoriteModel, questionModel } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 收藏 / 取消收藏（toggle）。返回 { favorited } 表示当前是否已收藏。
 */
const toggle = asyncHandler(async (req, res) => {
  const questionId = Number(req.body.question_id);
  if (!questionId) {
    return res.status(400).json({ message: '问题ID不正确' });
  }

  const question = await questionModel.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: '问题不存在' });
  }

  const existing = await favoriteModel.findOne(req.user.id, questionId);
  if (existing) {
    await favoriteModel.remove(req.user.id, questionId);
    return res.json({ favorited: false });
  }

  await favoriteModel.create({ user_id: req.user.id, question_id: questionId });
  return res.status(201).json({ favorited: true });
});

/**
 * 当前用户收藏的问题列表（按收藏时间倒序），支持分页。
 */
const list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const offset = Number(req.query.offset) || 0;
  const rows = await favoriteModel.list(req.user.id, { limit, offset });
  const total = await favoriteModel.countByUser(req.user.id);
  res.json({ list: rows, total, limit, offset });
});

/**
 * 查询当前用户对给定问题（支持批量，逗号分隔）是否已收藏。
 * 返回 { map: { [question_id]: boolean } }
 */
const status = asyncHandler(async (req, res) => {
  const raw = req.query.question_id;
  if (!raw) {
    return res.status(400).json({ message: '问题ID不正确' });
  }
  const ids = String(raw)
    .split(',')
    .map((x) => Number(x))
    .filter((x) => x);

  const map = {};
  if (ids.length) {
    const rows = await favoriteModel.findMany(req.user.id, ids);
    const set = new Set(rows.map((r) => r.question_id));
    ids.forEach((id) => {
      map[id] = set.has(id);
    });
  }
  res.json({ map });
});

module.exports = { toggle, list, status };
