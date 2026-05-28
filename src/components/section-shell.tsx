export function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-2 max-w-3xl">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
}

export function AskHermesHint({ examples }: { examples: string[] }) {
  return (
    <section className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-5">
      <h2 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
        <span aria-hidden>⚕</span> Or just ask Hermes
      </h2>
      <p className="text-xs text-indigo-800 mt-1">
        Click the chat orb in the corner and try things like:
      </p>
      <ul className="mt-3 space-y-1.5">
        {examples.map((e) => (
          <li key={e}>
            <code className="block text-sm text-indigo-900 bg-white border border-indigo-200 rounded px-3 py-1.5">
              {e}
            </code>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-4 py-6 text-center">
      {children}
    </p>
  );
}
