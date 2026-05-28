import Link from "next/link";
import {
  listAllOutputs,
  listProcesses,
  listMethodologies,
} from "@/lib/omni";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

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

  return (
    <SectionShell
      title="Audits"
      capability="Capability 05 — Audit a Site"
      subtitle="Multi-angle site analysis with concrete findings. AIO readiness · Retrieval readiness · Publication velocity · Lane portfolio. Each audit produces a markdown deliverable in the project's outputs/audits/ folder."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Available audits
        </h2>
        <ProcessGrid kind="processes" entries={auditProcesses} />
      </section>

      <section className="mb-10">
        <PlaceholderRunButton
          label="Run audit on a project"
          why="Triggering an audit fires the matching process against a chosen client. Output lands at custom/projects/<slug>/outputs/audits/. Wiring the trigger button is the next iteration — for now Hermes runs audits via the daily orchestrator + executor cron."
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent audit deliverables ({auditOutputs.length})
        </h2>
        {auditOutputs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No audits have been produced yet. Once Hermes runs an audit it will
            land in <code className="text-xs">custom/projects/&lt;slug&gt;/outputs/audits/</code>.
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
