import Link from "next/link";
import { listProjects, listAllOutputs } from "@/lib/omni";
import { listTasksByColumn as listKanbanByColumn } from "@/lib/kanban";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const projects = listProjects();
  const outputs = listAllOutputs();
  const buckets = listKanbanByColumn();
  const pending = buckets.pending.length;
  const officeReview = buckets.officeReview.length;
  const completed = buckets.completed.length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          {today}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">
          Dashboard
        </h1>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link
          href="/projects"
          className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
        >
          <div className="text-xs text-slate-500">Active clients</div>
          <div className="text-3xl font-semibold text-slate-900 mt-1 tabular-nums">
            {projects.length}
          </div>
        </Link>
        <Link
          href="/approvals"
          className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
        >
          <div className="text-xs text-slate-500">Pending approvals</div>
          <div className="text-3xl font-semibold text-slate-900 mt-1 tabular-nums">
            {pending}
          </div>
        </Link>
        <Link
          href="/approvals"
          className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 hover:border-orange-300"
        >
          <div className="text-xs text-orange-700">Office review</div>
          <div className="text-3xl font-semibold text-orange-900 mt-1 tabular-nums">
            {officeReview}
          </div>
        </Link>
        <Link
          href="/approvals"
          className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 hover:border-emerald-300"
        >
          <div className="text-xs text-emerald-700">Completed</div>
          <div className="text-3xl font-semibold text-emerald-900 mt-1 tabular-nums">
            {completed}
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent deliverables
        </h2>
        {outputs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No deliverables yet. Use{" "}
            <Link href="/audits" className="text-indigo-600 hover:underline">
              Audits
            </Link>
            ,{" "}
            <Link href="/content" className="text-indigo-600 hover:underline">
              Content
            </Link>
            , or just ask the chat orb to start.
          </p>
        ) : (
          <ul className="space-y-2">
            {outputs.slice(0, 8).map((o) => (
              <li key={o.path}>
                <Link
                  href={`/projects/${o.projectSlug}?tab=outputs&file=${encodeURIComponent(`outputs/${o.kind}/${o.filename}`)}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {o.title}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatDate(o.modifiedAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {o.projectSlug} ·{" "}
                    <span className="capitalize">{o.kind}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Common asks */}
      <section className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-5">
        <h2 className="text-sm font-semibold text-indigo-900 flex items-center gap-2 mb-3">
          <span aria-hidden>⚕</span> Common asks for Hermes
        </h2>
        <p className="text-xs text-indigo-800 mb-3">
          Click the chat orb (bottom-right) and try any of these:
        </p>
        <ul className="space-y-1.5">
          {[
            "Run an AIO readiness audit for air-sense-environmental",
            "Onboard a new prospect — name 'Acme Roofing', domain acmeroofing.com",
            "What's pending in today's approvals?",
            "Draft a new blog post for air-sense about radon testing kits",
            "Generate the monthly rank report for air-sense for May",
          ].map((e) => (
            <li key={e}>
              <code className="block text-sm text-indigo-900 bg-white border border-indigo-200 rounded px-3 py-1.5">
                {e}
              </code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
