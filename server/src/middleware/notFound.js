const notFound = (req, res) => {
  res.status(404).json({ message: `接口不存在：${req.method} ${req.originalUrl}` });
};

module.exports = notFound;
