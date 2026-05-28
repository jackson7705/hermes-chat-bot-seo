import Link from "next/link";
import { listAllOutputs } from "@/lib/omni";
import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";
import { PublishDraftButton } from "@/components/publish-draft-button";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ContentPage() {
  const drafts = listAllOutputs("drafts");
  const refreshes = listAllOutputs("refreshes");
  const briefs = listAllOutputs("briefs");

  return (
    <SectionShell
      title="Content"
      subtitle="Plan, produce, refresh, publish. The end-to-end pipeline from topic to live page — with AEO baked in."
    >
      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Kick off content work
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ask Hermes for what you need. Drafts land in <code className="text-[10px]">outputs/drafts/</code>;
          publishes go through the Approvals kanban; refreshes save to <code className="text-[10px]">outputs/refreshes/</code>.
        </p>
        <ul className="space-y-1.5">
          <li>
            <code className="block text-sm text-indigo-900 bg-indigo-50 border border-indigo-200 rounded px-3 py-1.5">
              Draft a new blog post for air-sense about radon testing kits
            </code>
          </li>
          <li>
            <code className="block text-sm text-indigo-900 bg-indigo-50 border border-indigo-200 rounded px-3 py-1.5">
              Refresh the radon-mitigation page for Air Sense
            </code>
          </li>
          <li>
            <code className="block text-sm text-indigo-900 bg-indigo-50 border border-indigo-200 rounded px-3 py-1.5">
              Generate the next 5 topics for Atlas Heating&apos;s backlog
            </code>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent drafts ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <EmptyHint>No drafts yet. Ask Hermes to draft a post.</EmptyHint>
        ) : (
          <ul className="space-y-2">
            {drafts.map((d) => (
              <li
                key={d.path}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <Link
                  href={`/outputs/${d.projectSlug}/${d.kind}/${encodeURIComponent(d.filename)}`}
                  className="block"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium text-slate-900 truncate hover:underline">
                      {d.title}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatDate(d.modifiedAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{d.projectSlug}</div>
                </Link>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <PublishDraftButton
                    projectSlug={d.projectSlug}
                    filename={d.filename}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(refreshes.length > 0 || briefs.length > 0) && (
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {refreshes.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Refresh proposals ({refreshes.length})
              </h3>
              <ul className="space-y-2">
                {refreshes.slice(0, 5).map((r) => (
                  <li key={r.path}>
                    <Link
                      href={`/outputs/${r.projectSlug}/${r.kind}/${encodeURIComponent(r.filename)}`}
                      className="block text-sm text-slate-700 hover:text-slate-900 truncate"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {briefs.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Briefs ({briefs.length})
              </h3>
              <ul className="space-y-2">
                {briefs.slice(0, 5).map((b) => (
                  <li key={b.path}>
                    <Link
                      href={`/outputs/${b.projectSlug}/${b.kind}/${encodeURIComponent(b.filename)}`}
                      className="block text-sm text-slate-700 hover:text-slate-900 truncate"
                    >
                      {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <AskHermesHint
        examples={[
          "Draft a new blog post for air-sense about radon testing kits",
          "Refresh the radon-mitigation page for Air Sense",
          "What pages need refreshing on the air-sense site?",
          "Generate the next 5 topics for Atlas Heating's backlog",
        ]}
      />
    </SectionShell>
  );
}
