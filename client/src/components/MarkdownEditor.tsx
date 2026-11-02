import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <textarea
        className="h-96 w-full rounded border border-gray-300 p-3 font-mono text-sm focus:border-indigo-500 focus:outline-none"
        placeholder="使用 Markdown 编写问题内容…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="prose min-h-96 max-w-none overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-gray-800">
        {value ? <ReactMarkdown>{value}</ReactMarkdown> : <p className="text-gray-400">预览区</p>}
      </div>
    </div>
  );
}
