import ReactMarkdown from "react-markdown";

export function MarkdownViewer({ source }: { source: string }) {
  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <ReactMarkdown
        components={{
          a: ({ children, ...props }) => (
            <a
              {...props}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ children, ...props }) => (
            <code
              {...props}
              className="rounded bg-slate-100 px-1 py-0.5 text-[0.85em] text-slate-900"
            >
              {children}
            </code>
          ),
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className="rounded-lg bg-slate-900 text-slate-100 p-4 text-xs overflow-x-auto"
            >
              {children}
            </pre>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
