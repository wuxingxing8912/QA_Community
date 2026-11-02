// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: '数据已存在，请勿重复提交' });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || '服务器内部错误' });
};

module.exports = errorHandler;
