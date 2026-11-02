import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Answer, Question } from '../types';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qVoted, setQVoted] = useState(false);
  const [aVoted, setAVoted] = useState<Record<number, boolean>>({});
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await client.get(`/questions/${id}`);
      setQuestion(data.question);
      setAnswers(data.answers || []);
      if (user) {
        const [qs, ...as] = await Promise.all([
          client.get(`/votes/status?target_type=question&target_id=${id}`),
          ...(data.answers || []).map((a: Answer) =>
            client.get(`/votes/status?target_type=answer&target_id=${a.id}`)
          ),
        ]);
        setQVoted(qs.data.voted);
        const map: Record<number, boolean> = {};
        (data.answers || []).forEach((a: Answer, i: number) => {
          map[a.id] = as[i].data.voted;
        });
        setAVoted(map);
      }
    } catch {
      setError('问题不存在或加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (loading) return <p className="text-gray-500">加载中…</p>;
  if (error || !question)
    return <p className="text-gray-500">{error || '问题不存在'}</p>;

  const isOwner = Boolean(user && question.author_id === user.id);

  const toggleQuestionVote = async () => {
    if (!user) return navigate('/login');
    const { data } = await client.post('/votes', {
      target_type: 'question',
      target_id: Number(id),
    });
    setQVoted(data.voted);
    setQuestion((q) => (q ? { ...q, votes: data.votes } : q));
  };

  const toggleAnswerVote = async (a: Answer) => {
    if (!user) return navigate('/login');
    const { data } = await client.post('/votes', {
      target_type: 'answer',
      target_id: a.id,
    });
    setAVoted((m) => ({ ...m, [a.id]: data.voted }));
    setAnswers((list) =>
      list.map((x) => (x.id === a.id ? { ...x, votes: data.votes } : x))
    );
  };

  const acceptAnswer = async (a: Answer) => {
    try {
      await client.put(`/answers/${a.id}/accept`);
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      await client.post('/answers', {
        content: answerText.trim(),
        question_id: Number(id),
      });
      setAnswerText('');
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || '回答失败');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteQuestion = async () => {
    if (!window.confirm('确定删除该问题？')) return;
    try {
      await client.delete(`/questions/${id}`);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <article className="rounded bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          {question.is_solved === 1 && (
            <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
              已解决
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>{question.author_name}</span>
          <span>{new Date(question.create_at).toLocaleDateString()}</span>
          <span>{question.views} 浏览</span>
          <span>{(question.tags || []).map((t) => `#${t}`).join(' ')}</span>
          {isOwner && (
            <span className="flex gap-2">
              <Link
                to={`/write/${question.id}`}
                className="text-indigo-600 hover:underline"
              >
                编辑
              </Link>
              <button onClick={deleteQuestion} className="text-red-600 hover:underline">
                删除
              </button>
            </span>
          )}
        </div>
        <div className="prose mt-4 max-w-none text-gray-800">
          <ReactMarkdown>{question.content}</ReactMarkdown>
        </div>
        <div className="mt-4">
          <button
            onClick={toggleQuestionVote}
            className={
              (qVoted ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600') +
              ' rounded px-3 py-1 text-sm hover:opacity-80'
            }
          >
            ♥ {question.votes} 赞
          </button>
        </div>
      </article>

      <section className="rounded bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {answers.length} 个回答
        </h2>
        <ul className="space-y-4">
          {answers.map((a) => (
            <li
              key={a.id}
              className={
                'border-b border-gray-100 pb-4 last:border-0' +
                (a.is_accepted === 1 ? ' bg-green-50/50' : '')
              }
            >
              {a.is_accepted === 1 && (
                <div className="mb-2 text-xs font-medium text-green-700">✓ 已采纳</div>
              )}
              <div className="prose max-w-none text-gray-800">
                <ReactMarkdown>{a.content}</ReactMarkdown>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{a.author_name}</span>
                <span>{new Date(a.create_at).toLocaleDateString()}</span>
                <button
                  onClick={() => toggleAnswerVote(a)}
                  className={
                    (aVoted[a.id] ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600') +
                    ' rounded px-2 py-0.5 hover:opacity-80'
                  }
                >
                  ♥ {a.votes}
                </button>
                {isOwner && a.is_accepted !== 1 && (
                  <button
                    onClick={() => acceptAnswer(a)}
                    className="rounded border border-indigo-300 px-2 py-0.5 text-indigo-600 hover:bg-indigo-50"
                  >
                    采纳
                  </button>
                )}
              </div>
            </li>
          ))}
          {!answers.length && <p className="text-sm text-gray-400">暂无回答</p>}
        </ul>
      </section>

      <section className="rounded bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">写回答</h2>
        {user ? (
          <form onSubmit={submitAnswer}>
            <textarea
              className="h-32 w-full rounded border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none"
              placeholder="用 Markdown 写下你的回答…"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            {error && <p className="mb-2 mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? '提交中…' : '提交回答'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            <Link to="/login" className="text-indigo-600">
              登录
            </Link>{' '}
            后即可回答
          </p>
        )}
      </section>
    </div>
  );
}
