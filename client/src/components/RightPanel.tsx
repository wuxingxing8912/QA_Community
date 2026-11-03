import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import type { Question, User } from '../types';

export default function RightPanel() {
  const [hot, setHot] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    client
      .get('/questions?sort=hot&limit=10')
      .then((r) => setHot(r.data.list || []))
      .catch(() => {});
    client
      .get('/users?limit=8')
      .then((r) => setUsers(r.data.list || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">全栈热榜</h3>
        <ol className="space-y-2 text-sm">
          {hot.map((q, i) => (
            <li key={q.id} className="flex gap-2">
              <span className={i < 3 ? 'font-semibold text-red-500' : 'text-gray-400'}>{i + 1}</span>
              <Link
                to={`/post/${q.id}`}
                className="line-clamp-1 text-gray-700 hover:text-indigo-600"
              >
                {q.title}
              </Link>
            </li>
          ))}
          {!hot.length && <li className="text-gray-400">暂无数据</li>}
        </ol>
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">推荐关注</h3>
        <ul className="space-y-2 text-sm">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between">
              <span className="text-gray-700">{u.username}</span>
              <span className="text-xs text-gray-400">{u.points ?? 0} 积分</span>
            </li>
          ))}
          {!users.length && <li className="text-gray-400">暂无数据</li>}
        </ul>
      </div>
    </div>
  );
}
