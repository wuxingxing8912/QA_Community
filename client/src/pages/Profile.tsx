import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="rounded bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">个人中心</h1>
      <dl className="mt-4 space-y-2 text-gray-700">
        <div className="flex gap-2">
          <dt className="w-20 text-gray-500">用户名</dt>
          <dd>{user.username}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 text-gray-500">邮箱</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 text-gray-500">积分</dt>
          <dd>{user.points}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 text-gray-500">注册于</dt>
          <dd>{new Date(user.create_at).toLocaleDateString()}</dd>
        </div>
      </dl>
      <button
        onClick={logout}
        className="mt-4 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        退出登录
      </button>
    </div>
  );
}
