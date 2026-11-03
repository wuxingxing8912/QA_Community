import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Question } from '../types';

const PAGE_SIZE = 10;

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    client
      .get(`/favorites?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`)
      .then((res) => {
        setList(res.data.list || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => {
        setList([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggleFavorite = async (q: Question) => {
    if (!user) return navigate('/login');
    try {
      await client.post('/favorites', { question_id: q.id });
      setList((prev) => prev.filter((x) => x.id !== q.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      window.alert('取消收藏失败，请稍后重试');
    }
  };

  return (
    <div className="rounded bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">我的收藏</h1>

      {loading ? (
        <p className="mt-3 text-gray-500">加载中…</p>
      ) : !list.length ? (
        <p className="mt-3 text-gray-400">
          还没有收藏的问题，去 <Link to="/" className="text-indigo-600">首页</Link> 看看吧。
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {list.map((q) => (
            <li key={q.id} className="rounded border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/post/${q.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                >
                  {q.title}
                </Link>
                <button
                  onClick={() => toggleFavorite(q)}
                  className="shrink-0 rounded bg-amber-50 px-2 py-1 text-xs text-amber-600 hover:opacity-80"
                >
                  ★ 取消收藏
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {q.is_solved === 1 && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    已解决
                  </span>
                )}
                {(q.tags || []).map((t) => (
                  <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    #{t}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                <span>{q.author_name}</span>
                <span>{new Date(q.create_at).toLocaleDateString()}</span>
                <span>{q.views} 浏览</span>
                <span>{q.answers_count} 回答</span>
                <span>{q.votes} 赞</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}（共 {total} 条）
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
