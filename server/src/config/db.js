const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool(config.db);

/**
 * 执行 SQL，返回 [rows, fields]
 */
const query = (sql, params = []) => pool.execute(sql, params);

/**
 * 获取连接（用于事务）
 */
const getConnection = () => pool.getConnection();

/**
 * 测试数据库连通性
 */
const testConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
};

module.exports = { pool, query, getConnection, testConnection };
