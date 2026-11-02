import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            问答社区
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            首页
          </Link>
          <Link to="/write" className="text-gray-600 hover:text-gray-900">
            提问
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-indigo-600">
                  {user.username}
                </Link>
                <button onClick={onLogout} className="text-gray-600 hover:text-gray-900">
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  登录
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-900">
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
