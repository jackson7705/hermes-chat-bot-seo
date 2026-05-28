import Link from "next/link";
import {
  listAllOutputs,
  listProcesses,
  listMethodologies,
  listProjects,
} from "@/lib/omni";
import { SectionShell, ProcessGrid } from "@/components/section-shell";
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
  const auditMethodologies = listMethodologies().filter(
    (m) =>
      m.slug.includes("retrieval-readiness-writing") ||
      m.slug.includes("information-gain") ||
      m.slug.includes("schema-strategy"),
  );
  const auditOutputs = listAllOutputs("audits");
  const projects = listProjects();

  return (
    <SectionShell
      title="Audits"
      capability="Capability 05 — Audit a Site"
      subtitle="Multi-angle site analysis with concrete findings. AIO readiness · Retrieval readiness · Publication velocity · Lane portfolio. Each audit produces a markdown deliverable in the project's outputs/audits/ folder."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Run an audit
        </h2>
        <RunProcessForm
          ctaLabel="Run audit"
          ctaSubmitting="Submitting…"
          successHint="Audit queued — Hermes is on it. The deliverable will appear in Recent audits below within ~2-5 minutes. This page auto-refreshes every 15s."
          projects={projects.map((p) => ({ slug: p.slug, label: p.slug }))}
          processes={auditProcesses.map((p) => ({
            slug: p.slug,
            title: p.title,
            path: p.path,
            outputKind: "audits",
          }))}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Available audit processes
        </h2>
        <ProcessGrid kind="processes" entries={auditProcesses} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent audit deliverables ({auditOutputs.length})
        </h2>
        {auditOutputs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No audits have been produced yet. Pick a client + audit type above
            and click Run.
          </p>
        ) : (
          <ul className="space-y-2">
            {auditOutputs.map((o) => (
              <li key={o.path}>
                <Link
                  href={`/projects/${o.projectSlug}?tab=outputs&file=${encodeURIComponent(`outputs/${o.kind}/${o.filename}`)}`}
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
                    {o.projectSlug} · <code className="font-mono">{o.filename}</code>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {auditMethodologies.length > 0 && (
        <section className="mt-10 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Related methodologies
          </h2>
          <ProcessGrid kind="methodologies" entries={auditMethodologies} />
        </section>
      )}
    </SectionShell>
  );
}
