const { query } = require('../config/db');

const USER_PUBLIC_FIELDS = 'id, username, email, avatar, points, create_at';

const create = async ({ username, email, password, avatar = null }) => {
  const sql = 'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)';
  const [result] = await query(sql, [username, email, password, avatar]);
  return result.insertId;
};

const findById = async (id) => {
  const [rows] = await query(`SELECT ${USER_PUBLIC_FIELDS} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findByUsername = async (username) => {
  const [rows] = await query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

// 相对增减积分
const changePoints = async (id, delta) => {
  await query('UPDATE users SET points = points + ? WHERE id = ?', [delta, id]);
};

module.exports = { USER_PUBLIC_FIELDS, create, findById, findByEmail, findByUsername, changePoints };
