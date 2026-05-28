import { listProcesses, listMethodologies, listAllOutputs } from "@/lib/omni";
import Link from "next/link";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ContentPage() {
  const execution = listProcesses().filter((p) => p.area === "execution");
  const research = listProcesses().filter(
    (p) =>
      p.area === "research" &&
      [
        "content-planning",
        "user-stories",
        "stories-to-queries",
      ].includes(p.slug),
  );
  const methodology = listMethodologies().filter((m) =>
    [
      "content-planning",
      "content-lane-discipline",
      "publication-velocity",
      "backlog-topic-generation",
      "content-refresh",
      "answer-engine-optimization",
      "producer-critic-revision-loop",
      "section-first-content-production",
      "editorial-review-framework",
      "information-gain",
      "intro-pattern-selection",
      "title-tag-meta-description",
    ].includes(m.slug),
  );
  const drafts = listAllOutputs("drafts");

  return (
    <SectionShell
      title="Content"
      capability="Capabilities 02-04, 06 — Plan, Produce, Refresh + AEO"
      subtitle="The full pipeline. Brief or topic → finished, published page. Includes outline / section-by-section writing / title + FAQ + CTA / AI image gen / internal link injection / AEO rewrite / publish."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Production processes
        </h2>
        <ProcessGrid kind="processes" entries={execution} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Planning + research
        </h2>
        <ProcessGrid kind="processes" entries={research} />
      </section>

      <section className="mb-10">
        <PlaceholderRunButton
          label="Run content pipeline"
          why="Pick a project + topic from the backlog → Hermes runs outline → section writing → FAQ/CTA → images → AEO rewrite → publishes to the configured CMS. Output is the live URL + the draft saved to outputs/drafts/."
        />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent drafts ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-slate-500">
            No drafts yet. Hermes-produced drafts land in{" "}
            <code className="text-xs">custom/projects/&lt;slug&gt;/outputs/drafts/</code>.
          </p>
        ) : (
          <ul className="space-y-2">
            {drafts.map((d) => (
              <li key={d.path}>
                <Link
                  href={`/projects/${d.projectSlug}?tab=outputs&file=${encodeURIComponent(`outputs/${d.kind}/${d.filename}`)}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium text-slate-900 truncate">{d.title}</h3>
                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatDate(d.modifiedAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{d.projectSlug}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {methodology.length > 0 && (
        <section className="mt-10 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Underlying methodology
          </h2>
          <ProcessGrid kind="methodologies" entries={methodology} />
        </section>
      )}
    </SectionShell>
  );
}
