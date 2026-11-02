import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import MarkdownEditor from '../components/MarkdownEditor';
import type { Question } from '../types';

export default function Write() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    client
      .get(`/questions/${id}`)
      .then((res) => {
        const q: Question = res.data.question;
        if (user && q.author_id !== user.id) {
          setError('只能编辑自己发布的问题');
          return;
        }
        setTitle(q.title);
        setContent(q.content);
        setTags(q.tags || []);
      })
      .catch(() => setError('加载问题失败'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await client.put(`/questions/${id}`, {
          title: title.trim(),
          content: content.trim(),
          tags,
        });
        navigate(`/post/${id}`);
      } else {
        const res = await client.post('/questions', {
          title: title.trim(),
          content: content.trim(),
          tags,
        });
        navigate(`/post/${res.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-500">加载中…</p>;

  return (
    <form onSubmit={onSave} className="rounded bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold text-gray-900">{isEdit ? '编辑问题' : '发布问题'}</h1>

      <input
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm text-gray-700"
          >
            #{t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="输入标签后回车添加"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50"
        >
          添加
        </button>
      </div>

      <MarkdownEditor value={content} onChange={setContent} />

      {error && <p className="mb-3 mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? '保存中…' : isEdit ? '保存修改' : '发布'}
      </button>
    </form>
  );
}
