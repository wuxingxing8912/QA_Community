import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await client.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm rounded bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold text-gray-900">登录</h1>
      <input
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        placeholder="用户名或邮箱"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? '登录中…' : '登录'}
      </button>
      <p className="mt-3 text-sm text-gray-500">
        还没有账号？<Link to="/register" className="text-indigo-600">去注册</Link>
      </p>
    </form>
  );
}
