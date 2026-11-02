require('../src/config/env');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = require('../src/config/env');

/**
 * 读取建表 SQL 并按语句拆分执行
 */
async function initDb() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    const sqlPath = path.join(__dirname, '..', 'src', 'config', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sql);
    console.log('✅ 数据库与数据表初始化完成');
  } finally {
    await connection.end();
  }
}

initDb().catch((err) => {
  console.error('❌ 初始化失败:', err.message);
  process.exit(1);
});
