const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { userModel } = require('../models');

const parseToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

/**
 * 校验 JWT 并挂载 req.user
 */
const auth = async (req, res, next) => {
  try {
    const token = parseToken(req);
    if (!token) {
      return res.status(401).json({ message: '未提供登录凭证' });
    }

    const payload = jwt.verify(token, config.jwt.secret);
    const user = await userModel.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: '用户不存在或已失效' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '登录凭证无效或已过期' });
  }
};

/**
 * 可选登录：有 token 则挂载用户，无 token 直接放行
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = parseToken(req);
    if (token) {
      const payload = jwt.verify(token, config.jwt.secret);
      req.user = await userModel.findById(payload.id);
    }
  } catch (error) {
    req.user = null;
  }
  next();
};

module.exports = { auth, optionalAuth };
