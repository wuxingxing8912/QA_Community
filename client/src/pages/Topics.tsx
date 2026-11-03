import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function Topics() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/questions?limit=100')
      .then((r) => {
        const tagSet = new Set<string>();
        (r.data.list || []).forEach((q: { tags?: string[] }) =>
          (q.tags || []).forEach((t) => tagSet.add(t))
        );
        setTags(Array.from(tagSet));
      })
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold text-gray-900">话题广场</h1>
      {loading ? (
        <p className="text-gray-500">加载中…</p>
      ) : tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t}
              to={`/?tag=${encodeURIComponent(t)}`}
              className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              #{t}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">暂无话题</p>
      )}
    </div>
  );
}
