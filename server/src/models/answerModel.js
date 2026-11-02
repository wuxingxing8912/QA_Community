const { query } = require('../config/db');

const create = async ({ content, question_id, author_id }) => {
  const sql = 'INSERT INTO answers (content, question_id, author_id) VALUES (?, ?, ?)';
  const [result] = await query(sql, [content, question_id, author_id]);
  return result.insertId;
};

const findByQuestionId = async (questionId) => {
  const sql = `
    SELECT a.*, u.username AS author_name, u.avatar AS author_avatar
    FROM answers a
    JOIN users u ON u.id = a.author_id
    WHERE a.question_id = ?
    ORDER BY a.is_accepted DESC, a.votes DESC, a.create_at ASC
  `;
  const [rows] = await query(sql, [questionId]);
  return rows;
};

const findById = async (id) => {
  const [rows] = await query('SELECT * FROM answers WHERE id = ?', [id]);
  return rows[0] || null;
};

const setAccepted = async (id, isAccepted) => {
  await query('UPDATE answers SET is_accepted = ? WHERE id = ?', [isAccepted ? 1 : 0, id]);
};

const incrementVotes = async (id, delta) => {
  await query('UPDATE answers SET votes = votes + ? WHERE id = ?', [delta, id]);
};

const remove = async (id) => {
  await query('DELETE FROM answers WHERE id = ?', [id]);
};

module.exports = { create, findByQuestionId, findById, setAccepted, incrementVotes, remove };
