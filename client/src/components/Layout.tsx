import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            问答社区
          </Link>
          <Link
            to="/write"
            className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
          >
            提问
          </Link>
          <div className="ml-auto flex items-center gap-3 text-sm">
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

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[200px_1fr_280px]">
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </aside>
        <main>
          <Outlet />
        </main>
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <RightPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
