import Link from "next/link";
import { notFound } from "next/navigation";
import {
  groupByArea,
  listMethodologies,
  listProcesses,
  listSkills,
  type LibraryEntry,
} from "@/lib/omni";

export const dynamic = "force-dynamic";

const KIND_META: Record<
  string,
  { title: string; subtitle: string; loader: () => LibraryEntry[] }
> = {
  methodologies: {
    title: "Methodologies",
    subtitle: "The brain — how to think.",
    loader: listMethodologies,
  },
  processes: {
    title: "Processes",
    subtitle: "The scripts — step-by-step playbooks.",
    loader: listProcesses,
  },
  skills: {
    title: "Skills",
    subtitle: "The hands — discrete agent capabilities.",
    loader: listSkills,
  },
};

const AREA_DESCRIPTIONS: Record<string, string> = {
  // methodologies
  strategy: "Strategic decisions: positioning, ICP, content lanes, what to publish.",
  research: "How the agent reasons about queries, AI retrieval, citation, AEO.",
  execution: "How content gets written, refreshed, linked, published.",
  architecture: "Site shape, URL structure, geographic + authority hierarchy.",
  // processes
  "client-engagement": "Onboarding a new client end-to-end.",
  analysis: "Audits — multi-angle site analysis.",
  deployment: "Authority Satellite Network rollout.",
  setup: "Infrastructure — email deliverability, etc.",
  meta: "System-care — playbook creation, knowledge ingestion.",
  // skills
  "data-access": "External data plumbing — Ahrefs, DataForSEO, GSC, Drive.",
  generation: "Output skills — outlines, FAQs, WordPress publish.",
};

export default async function LibraryKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const meta = KIND_META[kind];
  if (!meta) notFound();
  const entries = meta.loader();
  const grouped = groupByArea(entries);
  const areas = Object.keys(grouped).sort();

  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <Link href="/library" className="text-xs text-slate-500 hover:text-slate-700">
          ← Library
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">
          {meta.title}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {meta.subtitle} {entries.length} entr{entries.length === 1 ? "y" : "ies"} across{" "}
          {areas.length} area{areas.length === 1 ? "" : "s"}.
        </p>
      </header>

      <div className="space-y-8">
        {areas.map((area) => (
          <section key={area}>
            <header className="mb-3 border-b border-slate-200 pb-2">
              <h2 className="text-sm font-semibold text-slate-900 capitalize">
                {area.replace(/-/g, " ")}
              </h2>
              {AREA_DESCRIPTIONS[area] && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {AREA_DESCRIPTIONS[area]}
                </p>
              )}
            </header>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {grouped[area].map((entry) => (
                <li key={`${entry.origin}:${entry.slug}`}>
                  <Link
                    href={`/library/${kind}/${entry.area}/${entry.slug}`}
                    className="block rounded-md border border-slate-200 bg-white p-3 hover:border-slate-300"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {entry.title}
                      </span>
                      {entry.origin !== "core" && (
                        <span className="text-[10px] uppercase tracking-wider rounded bg-indigo-100 text-indigo-700 px-1.5 py-0.5">
                          {entry.origin}
                        </span>
                      )}
                    </div>
                    <code className="block text-[11px] text-slate-400 font-mono mt-1 truncate">
                      {entry.slug}
                    </code>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
