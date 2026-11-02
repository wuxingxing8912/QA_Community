import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await client.post('/auth/register', { username, email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm rounded bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold text-gray-900">注册</h1>
      <input
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        placeholder="用户名（3-20 位字母/数字/下划线）"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        placeholder="密码（至少 6 位）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? '注册中…' : '注册'}
      </button>
      <p className="mt-3 text-sm text-gray-500">
        已有账号？<Link to="/login" className="text-indigo-600">去登录</Link>
      </p>
    </form>
  );
}
