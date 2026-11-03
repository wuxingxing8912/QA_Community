const { query } = require('../config/db');

// 启动时确保 favorites 表存在（幂等，避免未执行 db:init 时功能不可用）
const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id          INT PRIMARY KEY AUTO_INCREMENT,
      user_id     INT NOT NULL,
      question_id INT NOT NULL,
      create_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_fav (user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
    )
  `);
};

const list = async (userId, { limit = 10, offset = 0 } = {}) => {
  const sql = `
    SELECT q.*, u.username AS author_name, u.avatar AS author_avatar, f.create_at AS favorited_at
    FROM favorites f
    JOIN question q ON q.id = f.question_id
    JOIN users u ON u.id = q.author_id
    WHERE f.user_id = ?
    ORDER BY f.create_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await query(sql, [userId, Number(limit), Number(offset)]);
  return rows;
};

const countByUser = async (userId) => {
  const [rows] = await query('SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?', [
    userId,
  ]);
  return rows[0].total;
};

const findOne = async (userId, questionId) => {
  const [rows] = await query(
    'SELECT * FROM favorites WHERE user_id = ? AND question_id = ?',
    [userId, questionId]
  );
  return rows[0] || null;
};

const findMany = async (userId, ids) => {
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await query(
    `SELECT question_id FROM favorites WHERE user_id = ? AND question_id IN (${placeholders})`,
    [userId, ...ids]
  );
  return rows;
};

const create = async ({ user_id, question_id }) => {
  const [result] = await query(
    'INSERT INTO favorites (user_id, question_id) VALUES (?, ?)',
    [user_id, question_id]
  );
  return result.insertId;
};

const remove = async (userId, questionId) => {
  await query('DELETE FROM favorites WHERE user_id = ? AND question_id = ?', [
    userId,
    questionId,
  ]);
};

module.exports = { list, countByUser, findOne, findMany, create, remove, ensureTable };
