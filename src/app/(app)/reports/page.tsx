import Link from "next/link";
import { listAllOutputs } from "@/lib/omni";
import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReportsPage() {
  const reports = listAllOutputs("reports");

  return (
    <SectionShell
      title="Reports"
      subtitle="Rank + AEO + GSC, turned into client-ready storytelling. Trajectory narratives, scorecards, landscape reports."
    >
      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Generate a report
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ask Hermes — period + report type + client. Output lands in{" "}
          <code className="text-[10px]">outputs/reports/</code> and is ready to send.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent reports ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <EmptyHint>
            No reports yet. Once GSC + Ahrefs are wired, reports get generated
            on schedule or on demand.
          </EmptyHint>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.path}>
                <Link
                  href={`/projects/${r.projectSlug}?tab=outputs&file=${encodeURIComponent(`outputs/${r.kind}/${r.filename}`)}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium text-slate-900 truncate">{r.title}</h3>
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

      <AskHermesHint
        examples={[
          "Generate the monthly rank report for air-sense for May",
          "What's our AEO visibility on Atlas Heating right now?",
          "Pull the last 7 days of GSC data for air-sense and write the narrative",
          "Forecast the radon-mitigation page's trajectory for the next 90 days",
        ]}
      />
    </SectionShell>
  );
}
