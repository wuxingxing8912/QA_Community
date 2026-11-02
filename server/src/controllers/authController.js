const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { userModel } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const SALT_ROUNDS = 10;

const signToken = (user) => jwt.sign({ id: user.id }, config.jwt.secret, {
  expiresIn: config.jwt.expiresIn,
});

const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  points: user.points,
  create_at: user.create_at,
});

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: '用户名、邮箱和密码不能为空' });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ message: '用户名需为 3-20 位字母、数字或下划线' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: '邮箱格式不正确' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: '密码长度不能少于 6 位' });
  }
  if (await userModel.findByEmail(email)) {
    return res.status(409).json({ message: '该邮箱已被注册' });
  }
  if (await userModel.findByUsername(username)) {
    return res.status(409).json({ message: '该用户名已被占用' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await userModel.create({ username, email, password: passwordHash });
  const user = await userModel.findById(id);

  res.status(201).json({ message: '注册成功', token: signToken(user), user: toPublicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  let user = await userModel.findByUsername(username);
  if (!user && username.includes('@')) {
    user = await userModel.findByEmail(username);
  }
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  res.json({ message: '登录成功', token: signToken(user), user: toPublicUser(user) });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

module.exports = { register, login, getMe, toPublicUser };
