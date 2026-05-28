import { listSkills, listAllOutputs } from "@/lib/omni";
import Link from "next/link";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReportsPage() {
  const dataAccess = listSkills().filter((s) => s.area === "data-access");
  const generation = listSkills().filter(
    (s) =>
      s.area === "generation" &&
      ["landscape-report-generator"].includes(s.slug),
  );
  const reportOutputs = listAllOutputs("reports");

  return (
    <SectionShell
      title="Reports"
      capability="Capability 10 — Performance Analysis & Client Reporting"
      subtitle="Turns raw rank + AEO + GSC data into client-ready storytelling. Ranking trajectory forecast · narrative rewriting · landscape + refresh reports as polished deliverables · formatted output (tables, scorecards, time-series)."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Data sources
        </h2>
        <ProcessGrid kind="skills" entries={dataAccess} />
      </section>

      {generation.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Generation skills
          </h2>
          <ProcessGrid kind="skills" entries={generation} />
        </section>
      )}

      <section className="mb-10">
        <PlaceholderRunButton
          label="Generate client report"
          why="Pick a client + reporting period. Hermes pulls Ahrefs rank state + GSC keyword/page/CTR data, writes the trajectory narrative, formats tables and scorecards, and saves the report to outputs/reports/ for CSM review."
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent reports ({reportOutputs.length})
        </h2>
        {reportOutputs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No reports generated yet. Once the GSC + Ahrefs integrations are wired,
            Hermes can produce monthly client reports automatically.
          </p>
        ) : (
          <ul className="space-y-2">
            {reportOutputs.map((r) => (
              <li key={r.path}>
                <Link
                  href={`/projects/${r.projectSlug}?tab=outputs&file=${encodeURIComponent(`outputs/${r.kind}/${r.filename}`)}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium text-slate-900 truncate">
                      {r.title}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatDate(r.modifiedAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{r.projectSlug}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SectionShell>
  );
}
