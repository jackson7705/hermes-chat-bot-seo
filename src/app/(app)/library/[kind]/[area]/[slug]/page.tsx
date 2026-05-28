import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listMethodologies,
  listProcesses,
  listSkills,
  readFile,
  type LibraryEntry,
} from "@/lib/omni";
import { MarkdownViewer } from "@/components/markdown-viewer";

export const dynamic = "force-dynamic";

const LOADERS: Record<string, () => LibraryEntry[]> = {
  methodologies: listMethodologies,
  processes: listProcesses,
  skills: listSkills,
};

export default async function LibraryEntryPage({
  params,
}: {
  params: Promise<{ kind: string; area: string; slug: string }>;
}) {
  const { kind, area, slug } = await params;
  const loader = LOADERS[kind];
  if (!loader) notFound();
  const entry = loader().find((e) => e.area === area && e.slug === slug);
  if (!entry) notFound();
  const content = readFile(entry.path);
  if (!content) notFound();

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
        <Link
          href={`/library/${kind}`}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ← {kind.charAt(0).toUpperCase() + kind.slice(1)}
        </Link>
        <div className="flex items-baseline justify-between gap-4 mt-1">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 truncate">
              {entry.title}
            </h1>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span className="capitalize">{area.replace(/-/g, " ")}</span>
              <span aria-hidden>·</span>
              <code className="font-mono">{entry.slug}</code>
              {entry.origin !== "core" && (
                <>
                  <span aria-hidden>·</span>
                  <span className="rounded bg-indigo-100 text-indigo-700 px-1.5 py-0.5 uppercase text-[9px] tracking-wider">
                    {entry.origin}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-4xl">
        <MarkdownViewer source={content} />
      </div>
    </div>
  );
}
