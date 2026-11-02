const { query } = require('../config/db');

const findOne = async (userId, targetType, targetId) => {
  const [rows] = await query(
    'SELECT * FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?',
    [userId, targetType, targetId]
  );
  return rows[0] || null;
};

const create = async ({ user_id, target_type, target_id }) => {
  const [result] = await query(
    'INSERT INTO votes (user_id, target_type, target_id) VALUES (?, ?, ?)',
    [user_id, target_type, target_id]
  );
  return result.insertId;
};

const remove = async (id) => {
  await query('DELETE FROM votes WHERE id = ?', [id]);
};

module.exports = { findOne, create, remove };
