import Link from "next/link";
import { notFound } from "next/navigation";
import { readStrategy } from "@/lib/omni";
import { MarkdownViewer } from "@/components/markdown-viewer";

export const dynamic = "force-dynamic";

export default function StrategyPage({
  params,
}: {
  params: { project: string; strategy: string };
}) {
  const result = readStrategy(params.project, params.strategy);
  if (!result) notFound();
  const { content, summary } = result;

  return (
    <div className="flex flex-col h-full">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
        <Link
          href="/strategies"
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ← All strategies
        </Link>
        <div className="flex items-baseline justify-between gap-4 mt-1">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 truncate">
              {summary.title}
            </h1>
            <div className="text-xs text-slate-500 mt-0.5">
              {summary.projectSlug}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-semibold text-slate-900 tabular-nums">
              {summary.completedSteps} / {summary.totalSteps}
            </div>
            <div className="text-xs text-slate-500">{summary.percent}% complete</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full ${
              summary.percent === 100
                ? "bg-emerald-500"
                : summary.percent === 0
                  ? "bg-slate-300"
                  : "bg-indigo-600"
            }`}
            style={{ width: `${summary.percent}%` }}
          />
        </div>
        {summary.nextStep && summary.percent < 100 && (
          <p className="text-xs text-slate-600 mt-2">
            <span className="font-medium">Next:</span> {summary.nextStep}
          </p>
        )}
      </div>

      {/* Markdown content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-4xl">
        <MarkdownViewer source={content} />
      </div>
    </div>
  );
}
