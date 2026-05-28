import Link from "next/link";
import type { LibraryEntry } from "@/lib/omni";

export function SectionShell({
  title,
  subtitle,
  capability,
  children,
}: {
  title: string;
  subtitle: string;
  capability: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-8 py-10 max-w-6xl">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600">
          {capability}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">
          {title}
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

export function ProcessGrid({
  kind,
  entries,
}: {
  kind: "methodologies" | "processes" | "skills";
  entries: LibraryEntry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500">No entries in this area.</p>
    );
  }
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {entries.map((e) => (
        <li key={`${e.origin}:${e.slug}`}>
          <Link
            href={`/library/${kind}/${e.area}/${e.slug}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
          >
            <h3 className="text-sm font-medium text-slate-900">{e.title}</h3>
            <code className="block text-[11px] text-slate-400 font-mono mt-1 truncate">
              {e.area} · {e.slug}
            </code>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PlaceholderRunButton({
  label,
  why,
}: {
  label: string;
  why: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center">
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-slate-200 text-slate-500 cursor-not-allowed"
      >
        {label}
      </button>
      <p className="text-xs text-slate-500 mt-3">{why}</p>
    </div>
  );
}
