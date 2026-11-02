require('./src/config/env');
const app = require('./src/app');
const config = require('./src/config/env');
const { testConnection } = require('./src/config/db');

app.listen(config.port, () => {
  console.log(`服务已启动: http://localhost:${config.port}`);
});

testConnection()
  .then(() => console.log('数据库连接成功'))
  .catch((err) => console.warn('数据库连接失败:', err.message));

process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝:', reason);
});
