const { getConnection } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const POINTS = {
  question: 5,
  answer: 10,
};

/**
 * 点赞 / 取消点赞（toggle）。
 * 规则：
 *  - 每个用户对同一目标只能点赞一次（votes 表唯一约束 + 事务内 FOR UPDATE 兜底）
 *  - 点赞后目标 votes +1（取消则 -1）
 *  - 同步调整目标作者积分（问题 +5 / 回答 +10，取消回退）
 *  - 返回 { voted, votes } 表示用户当前是否已点赞及最新票数
 * 使用事务保证 votes、users.points、votes 表三处改动一致性。
 */
const toggle = asyncHandler(async (req, res) => {
  const { target_type, target_id } = req.body;

  if (!POINTS[target_type] || !target_id) {
    return res.status(400).json({ message: '点赞目标类型或ID不正确' });
  }

  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // 锁定目标行，读取作者与当前票数
    let authorId;
    let currentVotes;
    if (target_type === 'question') {
      const [rows] = await connection.execute(
        'SELECT id, author_id, votes FROM question WHERE id = ? FOR UPDATE',
        [target_id]
      );
      if (!rows.length) {
        await connection.rollback();
        return res.status(404).json({ message: '问题不存在' });
      }
      authorId = rows[0].author_id;
      currentVotes = rows[0].votes;
    } else {
      const [rows] = await connection.execute(
        'SELECT id, author_id, votes FROM answers WHERE id = ? FOR UPDATE',
        [target_id]
      );
      if (!rows.length) {
        await connection.rollback();
        return res.status(404).json({ message: '回答不存在' });
      }
      authorId = rows[0].author_id;
      currentVotes = rows[0].votes;
    }

    // 锁定该用户在此目标上的点赞记录
    const [existing] = await connection.execute(
      'SELECT * FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ? FOR UPDATE',
      [req.user.id, target_type, target_id]
    );

    if (existing.length) {
      // 取消点赞
      await connection.execute('DELETE FROM votes WHERE id = ?', [existing[0].id]);
      await connection.execute('UPDATE users SET points = points - ? WHERE id = ?', [
        POINTS[target_type],
        authorId,
      ]);
      const table = target_type === 'question' ? 'question' : 'answers';
      await connection.execute(`UPDATE ${table} SET votes = votes - 1 WHERE id = ?`, [target_id]);
      await connection.commit();
      return res.json({ voted: false, votes: currentVotes - 1 });
    }

    // 点赞（并发重复时由唯一约束兜底，返回已点赞且不重复加分）
    try {
      await connection.execute(
        'INSERT INTO votes (user_id, target_type, target_id) VALUES (?, ?, ?)',
        [req.user.id, target_type, target_id]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        await connection.rollback();
        return res.json({ voted: true, votes: currentVotes });
      }
      throw err;
    }

    await connection.execute('UPDATE users SET points = points + ? WHERE id = ?', [
      POINTS[target_type],
      authorId,
    ]);
    const table = target_type === 'question' ? 'question' : 'answers';
    await connection.execute(`UPDATE ${table} SET votes = votes + 1 WHERE id = ?`, [target_id]);
    await connection.commit();
    return res.status(201).json({ voted: true, votes: currentVotes + 1 });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

/**
 * 查询当前用户对某目标是否已点赞（用于详情页初始化状态）
 */
const status = asyncHandler(async (req, res) => {
  const { target_type, target_id } = req.query;
  if (!POINTS[target_type] || !target_id) {
    return res.status(400).json({ message: '目标类型或ID不正确' });
  }
  const { voteModel } = require('../models');
  const existing = await voteModel.findOne(req.user.id, target_type, target_id);
  res.json({ voted: Boolean(existing) });
});

module.exports = { toggle, status };
