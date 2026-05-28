import Link from "next/link";
import { listAllStrategies, type StrategySummary } from "@/lib/omni";

export const dynamic = "force-dynamic";

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
      <div
        className={`h-full ${
          percent === 100
            ? "bg-emerald-500"
            : percent === 0
              ? "bg-slate-300"
              : "bg-indigo-600"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function StrategyCard({ s }: { s: StrategySummary }) {
  return (
    <Link
      href={`/strategies/${s.projectSlug}/${s.strategySlug}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-medium text-slate-900 truncate">{s.title}</h3>
        <span className="text-xs text-slate-500 shrink-0 tabular-nums">
          {s.completedSteps}/{s.totalSteps}
        </span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{s.projectSlug}</div>
      <div className="mt-3 space-y-1.5">
        <ProgressBar percent={s.percent} />
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>{s.percent}% complete</span>
          {s.nextStep && (
            <span className="truncate ml-2 max-w-[55%]" title={s.nextStep}>
              next: {s.nextStep}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function StrategiesPage() {
  const strategies = listAllStrategies();

  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Strategies
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {strategies.length} across all projects, sorted by most recent edit.
        </p>
      </header>

      {strategies.length === 0 ? (
        <p className="text-sm text-slate-500">
          No strategies found yet. Add markdown files at{" "}
          <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
            custom/projects/&lt;slug&gt;/strategies/
          </code>{" "}
          with <code className="text-xs">- [ ]</code> checkboxes for steps.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strategies.map((s) => (
            <li key={`${s.projectSlug}:${s.strategySlug}`}>
              <StrategyCard s={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
