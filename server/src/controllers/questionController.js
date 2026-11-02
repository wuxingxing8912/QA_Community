const { questionModel, answerModel, userModel } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const offset = Number(req.query.offset) || 0;
  const keyword = (req.query.keyword || '').toString().trim();
  const tag = (req.query.tag || '').toString().trim();
  const solved = (req.query.solved || '').toString().trim();
  const sort = (req.query.sort || 'latest').toString().trim();

  const { list, total } = await questionModel.findList({
    limit,
    offset,
    keyword,
    tag,
    solved,
    sort,
  });
  res.json({ list, total, limit, offset });
});

const detail = asyncHandler(async (req, res) => {
  const question = await questionModel.findById(req.params.id);
  if (!question) {
    return res.status(404).json({ message: '问题不存在' });
  }
  await questionModel.incrementViews(question.id);
  const answers = await answerModel.findByQuestionId(question.id);
  res.json({ question, answers });
});

const create = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: '标题和内容不能为空' });
  }

  const id = await questionModel.create({
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
    author_id: req.user.id,
  });

  // 发布问题 -5 积分
  await userModel.changePoints(req.user.id, -5);

  res.status(201).json({ id });
});

const update = asyncHandler(async (req, res) => {
  const question = await questionModel.findById(req.params.id);
  if (!question) {
    return res.status(404).json({ message: '问题不存在' });
  }
  if (question.author_id !== req.user.id) {
    return res.status(403).json({ message: '只能编辑自己发布的问题' });
  }

  const { title, content, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: '标题和内容不能为空' });
  }

  await questionModel.update(question.id, {
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
  });

  res.json({ message: '更新成功' });
});

const remove = asyncHandler(async (req, res) => {
  const question = await questionModel.findById(req.params.id);
  if (!question) {
    return res.status(404).json({ message: '问题不存在' });
  }
  if (question.author_id !== req.user.id) {
    return res.status(403).json({ message: '只能删除自己发布的问题' });
  }

  await questionModel.remove(question.id);
  res.json({ message: '已删除' });
});

module.exports = { list, detail, create, update, remove };
