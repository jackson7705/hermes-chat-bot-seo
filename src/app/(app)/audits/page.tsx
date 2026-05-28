import Link from "next/link";
import {
  listAllOutputs,
  listProcesses,
  listProjects,
} from "@/lib/omni";
import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";
import { RunProcessForm } from "@/components/run-process-form";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AuditsPage() {
  const auditProcesses = listProcesses().filter((p) => p.area === "analysis");
  const auditOutputs = listAllOutputs("audits");
  const projects = listProjects();

  return (
    <SectionShell
      title="Audits"
      subtitle="Multi-angle site analysis with concrete findings. Pick a client + audit type, click Run, and the deliverable lands here."
    >
      <section className="mb-8">
        <RunProcessForm
          ctaLabel="Run audit"
          ctaSubmitting="Submitting…"
          successHint="Audit queued — Hermes is on it. The deliverable will appear below within ~2-5 minutes. This page auto-refreshes."
          projects={projects.map((p) => ({ slug: p.slug, label: p.slug }))}
          processes={auditProcesses.map((p) => ({
            slug: p.slug,
            title: p.title,
            path: p.path,
            outputKind: "audits",
          }))}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent audits ({auditOutputs.length})
        </h2>
        {auditOutputs.length === 0 ? (
          <EmptyHint>
            No audits produced yet. Pick a client + audit type above and click Run.
          </EmptyHint>
        ) : (
          <ul className="space-y-2">
            {auditOutputs.map((o) => (
              <li key={o.path}>
                <Link
                  href={`/outputs/${o.projectSlug}/${o.kind}/${encodeURIComponent(o.filename)}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium text-slate-900 truncate">
                      {o.title}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatDate(o.modifiedAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {o.projectSlug}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AskHermesHint
        examples={[
          "Run an AIO readiness audit for air-sense-environmental",
          "Audit Atlas Heating for retrieval readiness",
          "What was the last audit produced for Air Sense?",
        ]}
      />
    </SectionShell>
  );
}
