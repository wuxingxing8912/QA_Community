import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import type { Question } from '../types';

const PAGE_SIZE = 10;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const keyword = searchParams.get('keyword') || '';
  const tag = searchParams.get('tag') || '';
  const solved = searchParams.get('solved') || '';
  const sort = searchParams.get('sort') || 'latest';

  const [list, setList] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favMap, setFavMap] = useState<Record<number, boolean>>({});

  const [kwInput, setKwInput] = useState(keyword);
  const [tagInput, setTagInput] = useState(tag);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (tag) params.set('tag', tag);
    if (solved) params.set('solved', solved);
    if (sort && sort !== 'latest') params.set('sort', sort);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String((page - 1) * PAGE_SIZE));

    client
      .get(`/questions?${params.toString()}`)
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
  }, [page, keyword, tag, solved, sort]);

  // 获取当前登录用户对列表问题的收藏状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !list.length) {
      setFavMap({});
      return;
    }
    const ids = list.map((q) => q.id).join(',');
    client
      .get(`/favorites/status?question_id=${ids}`)
      .then((res) => setFavMap(res.data.map || {}))
      .catch(() => setFavMap({}));
  }, [list]);

  const updateParams = (next: Record<string, string>) => {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v) merged.set(k, v);
      else merged.delete(k);
    });
    merged.delete('page');
    setSearchParams(merged);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ keyword: kwInput.trim(), tag: tagInput.trim() });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
        <input
          className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="搜索问题标题或内容"
          value={kwInput}
          onChange={(e) => setKwInput(e.target.value)}
        />
        <input
          className="w-40 rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="按标签筛选"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <select
          className="rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          value={solved}
          onChange={(e) => updateParams({ solved: e.target.value })}
        >
          <option value="">全部状态</option>
          <option value="1">已解决</option>
          <option value="0">未解决</option>
        </select>
        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          搜索
        </button>
      </form>

      <div className="mb-4 flex gap-2 text-sm">
        {[
          ['latest', '最新'],
          ['hot', '热门'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => updateParams({ sort: val === 'latest' ? '' : val })}
            className={
              (sort === val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600') +
              ' rounded border border-gray-300 px-3 py-1'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">加载中…</p>
      ) : !list.length ? (
        <p className="text-gray-500">
          暂无匹配的问题，去 <Link to="/write" className="text-indigo-600">提问</Link> 吧。
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((q) => (
            <li key={q.id} className="rounded bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/post/${q.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                >
                  {q.title}
                </Link>
                <button
                  onClick={() => toggleFavorite(q)}
                  title={favMap[q.id] ? '取消收藏' : '收藏'}
                  className={
                    (favMap[q.id] ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400') +
                    ' shrink-0 text-xl leading-none'
                  }
                >
                  {favMap[q.id] ? '★' : '☆'}
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {q.is_solved === 1 && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    已解决
                  </span>
                )}
                {(q.tags || []).map((t) => (
                  <span
                    key={t}
                    className="cursor-pointer rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                      setTagInput(t);
                      updateParams({ tag: t });
                    }}
                  >
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
            onClick={() => updateParamsWithPage(page - 1)}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}（共 {total} 条）
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => updateParamsWithPage(page + 1)}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );

  function updateParamsWithPage(p: number) {
    const merged = new URLSearchParams(searchParams);
    if (p > 1) merged.set('page', String(p));
    else merged.delete('page');
    setSearchParams(merged);
  }

  const toggleFavorite = async (q: Question) => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await client.post('/favorites', { question_id: q.id });
      setFavMap((m) => ({ ...m, [q.id]: data.favorited }));
    } catch {
      window.alert('收藏失败，请稍后重试');
    }
  };
}
