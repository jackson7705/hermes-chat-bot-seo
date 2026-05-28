import Link from "next/link";
import { listProjectEnvStatus } from "@/lib/omni";
import { SectionShell } from "@/components/section-shell";

export const dynamic = "force-dynamic";

const INTEGRATIONS = [
  {
    name: "Hermes Agent (API Server)",
    status: "connected" as const,
    note: "OAuth via Claude Pro/Max. Model: claude-sonnet-4-6. Endpoint: hermes-agent-p6xk-hermes-agent-1:8642/v1 (internal).",
  },
  {
    name: "omni-sync (GitHub deploy key)",
    status: "connected" as const,
    note: "Pulls jackson7705/omni every 5 minutes via cron. Read-only deploy key on the VPS.",
  },
  {
    name: "omni-orchestrate cron",
    status: "connected" as const,
    note: "Daily 9am Central — scans strategies, queues kanban approval tasks.",
  },
  {
    name: "omni-executor cron",
    status: "connected" as const,
    note: "Every 5 minutes — picks up approved tasks, executes what it can, comments artifacts.",
  },
  {
    name: "WordPress (per-project)",
    status: "partial" as const,
    note: "Air Sense has WP_URL / WP_USER / WP_APP_PASSWORD wired. Other clients need their per-project .env populated.",
  },
  {
    name: "Google Search Console",
    status: "missing" as const,
    note: "GSC connection skill exists in omni; OAuth not wired on the VPS Hermes. Needed for capability 10 (Performance & Reporting).",
  },
  {
    name: "Ahrefs Brand Radar",
    status: "missing" as const,
    note: "Ahrefs API key per project. Needed for capability 06 (AI Search & AEO).",
  },
  {
    name: "DataForSEO (fallback for Ahrefs)",
    status: "missing" as const,
    note: "Per-project DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD. Cheaper coverage if Ahrefs isn't preferred.",
  },
  {
    name: "Smartlead / Resend (outreach)",
    status: "missing" as const,
    note: "Required for capability 07 (Link Building & Outreach At Scale) — campaign delivery + deliverability.",
  },
  {
    name: "Prime Indexer",
    status: "partial" as const,
    note: "PRIME_INDEXER_API_KEY is set in Air Sense .env. Submission-side wiring pending.",
  },
];

const STATUS_STYLES = {
  connected: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  missing: "bg-rose-100 text-rose-800",
};

export default function SettingsPage() {
  const projects = listProjectEnvStatus();

  return (
    <SectionShell
      title="Settings"
      subtitle="Per-client credentials, integration health, team. The platform reads from /opt/data/omni/custom/projects/<slug>/.env on the VPS; mirror your Mac copy with rsync after edits."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Client credentials ({projects.filter((p) => p.hasEnv).length} of {projects.length} configured)
        </h2>
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.slug}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/projects/${p.slug}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {p.slug}
                </Link>
                <span
                  className={`text-[10px] uppercase tracking-wider rounded px-2 py-0.5 font-medium ${
                    p.hasEnv ? STATUS_STYLES.connected : STATUS_STYLES.missing
                  }`}
                >
                  {p.hasEnv ? `${p.keys.length} keys` : ".env missing"}
                </span>
              </div>
              {p.hasEnv ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.keys.map((k) => (
                    <code
                      key={k}
                      className="text-[11px] font-mono bg-slate-100 text-slate-700 rounded px-1.5 py-0.5"
                    >
                      {k}
                    </code>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  Create <code className="text-[11px] font-mono">custom/projects/{p.slug}/.env</code> with the client's WordPress + per-tool credentials, then rsync to the VPS. See <Link href="/projects/air-sense-environmental" className="text-indigo-600 hover:underline">air-sense-environmental</Link> for the template.
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Integrations
        </h2>
        <ul className="space-y-2">
          {INTEGRATIONS.map((i) => (
            <li
              key={i.name}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-medium text-slate-900">{i.name}</h3>
                <span
                  className={`text-[10px] uppercase tracking-wider rounded px-2 py-0.5 font-medium ${STATUS_STYLES[i.status]}`}
                >
                  {i.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {i.note}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </SectionShell>
  );
}
