const { query } = require('../config/db');

const create = async ({ title, content, tags, author_id }) => {
  const sql =
    'INSERT INTO question (title, content, tags, author_id) VALUES (?, ?, ?, ?)';
  const [result] = await query(sql, [title, content, JSON.stringify(tags || []), author_id]);
  return result.insertId;
};

const findList = async ({
  limit = 10,
  offset = 0,
  keyword = '',
  tag = '',
  solved = '',
  sort = 'latest',
} = {}) => {
  const where = [];
  const params = [];

  if (keyword) {
    where.push('(q.title LIKE ? OR q.content LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (tag) {
    where.push('JSON_CONTAINS(q.tags, CONCAT(\'"\', ?, \'"\'))');
    params.push(tag);
  }
  if (solved === '1' || solved === '0') {
    where.push('q.is_solved = ?');
    params.push(Number(solved));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = sort === 'hot' ? 'q.votes DESC, q.create_at DESC' : 'q.create_at DESC';

  const listSql = `
    SELECT q.*, u.username AS author_name, u.avatar AS author_avatar
    FROM question q
    JOIN users u ON u.id = q.author_id
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const countSql = `SELECT COUNT(*) AS total FROM question q ${whereSql}`;

  const [rows] = await query(listSql, [...params, Number(limit), Number(offset)]);
  const [countRows] = await query(countSql, params);
  return { list: rows, total: countRows[0].total };
};

const findById = async (id) => {
  const sql = `
    SELECT q.*, u.username AS author_name, u.avatar AS author_avatar
    FROM question q
    JOIN users u ON u.id = q.author_id
    WHERE q.id = ?
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
};

const incrementViews = async (id) => {
  await query('UPDATE question SET views = views + 1 WHERE id = ?', [id]);
};

const incrementVotes = async (id, delta) => {
  await query('UPDATE question SET votes = votes + ? WHERE id = ?', [delta, id]);
};

const incrementAnswersCount = async (id, delta) => {
  await query('UPDATE question SET answers_count = answers_count + ? WHERE id = ?', [delta, id]);
};

const setSolved = async (id, solved) => {
  await query('UPDATE question SET is_solved = ? WHERE id = ?', [solved ? 1 : 0, id]);
};

const findAccepted = async (questionId) => {
  const [rows] = await query(
    'SELECT * FROM answers WHERE question_id = ? AND is_accepted = 1 LIMIT 1',
    [questionId]
  );
  return rows[0] || null;
};

const update = async (id, { title, content, tags }) => {
  await query('UPDATE question SET title = ?, content = ?, tags = ? WHERE id = ?', [
    title,
    content,
    JSON.stringify(tags || []),
    id,
  ]);
};

const remove = async (id) => {
  await query('DELETE FROM question WHERE id = ?', [id]);
};

module.exports = {
  create,
  findList,
  findById,
  incrementViews,
  incrementVotes,
  incrementAnswersCount,
  setSolved,
  findAccepted,
  update,
  remove,
};
