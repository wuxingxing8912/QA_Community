const { answerModel, questionModel, userModel } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const POINTS_ANSWER = 10;
const POINTS_ACCEPT = 30;

const create = asyncHandler(async (req, res) => {
  const { content, question_id } = req.body;

  if (!content || !question_id) {
    return res.status(400).json({ message: '内容和问题ID不能为空' });
  }

  const question = await questionModel.findById(question_id);
  if (!question) {
    return res.status(404).json({ message: '问题不存在' });
  }

  const id = await answerModel.create({
    content,
    question_id,
    author_id: req.user.id,
  });

  // 回答问题 +10 积分，问题回答数 +1
  await userModel.changePoints(req.user.id, POINTS_ANSWER);
  await questionModel.incrementAnswersCount(question_id, 1);

  res.status(201).json({ id });
});

const accept = asyncHandler(async (req, res) => {
  const answer = await answerModel.findById(req.params.id);
  if (!answer) {
    return res.status(404).json({ message: '回答不存在' });
  }

  const question = await questionModel.findById(answer.question_id);
  if (!question) {
    return res.status(404).json({ message: '问题不存在' });
  }
  if (question.author_id !== req.user.id) {
    return res.status(403).json({ message: '只能采纳自己问题的回答' });
  }

  const alreadyAccepted = answer.is_accepted === 1;

  if (alreadyAccepted) {
    // 取消采纳：回退积分，问题标记未解决
    await answerModel.setAccepted(answer.id, false);
    await questionModel.setSolved(question.id, false);
    await userModel.changePoints(answer.author_id, -POINTS_ACCEPT);
    return res.json({ message: '已取消采纳' });
  }

  // 若此前有已采纳的回答，先回退其积分
  const previous = await questionModel.findAccepted(question.id);
  if (previous && previous.id !== answer.id) {
    await answerModel.setAccepted(previous.id, false);
    await userModel.changePoints(previous.author_id, -POINTS_ACCEPT);
  }

  await answerModel.setAccepted(answer.id, true);
  await questionModel.setSolved(question.id, true);
  await userModel.changePoints(answer.author_id, POINTS_ACCEPT);

  res.json({ message: '已采纳' });
});

module.exports = { create, accept };
