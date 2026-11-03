import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = [
  { label: '综合推荐', to: '/' },
  { label: '热门绑定', to: '/?sort=hot' },
  { label: '话题广场', to: '/topics' },
  { label: '专栏文章', to: '/columns' },
];

export default function Sidebar() {
  const { user } = useAuth();

  const base =
    'block rounded px-3 py-2 ';
  const active = 'bg-indigo-50 text-indigo-700 font-medium';
  const idle = 'text-gray-700 hover:bg-gray-100';

  return (
    <nav className="space-y-6 text-sm">
      <div>
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">分类</h3>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.to}>
              <NavLink
                to={c.to}
                end={c.to === '/'}
                className={({ isActive }) => base + (isActive ? active : idle)}
              >
                {c.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {user && (
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">我的</h3>
          <ul className="space-y-1">
            <li>
              <NavLink to="/favorites" className={({ isActive }) => base + (isActive ? active : idle)}>
                我的收藏
              </NavLink>
            </li>
            <li>
              <NavLink to="/following" className={({ isActive }) => base + (isActive ? active : idle)}>
                关注的内容
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
