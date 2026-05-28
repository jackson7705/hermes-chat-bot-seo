import Link from "next/link";
import { listProjects } from "@/lib/omni";
import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function ProspectsPage() {
  // For now, prospects = early-stage projects (no strategies yet)
  const allProjects = listProjects();
  const prospects = allProjects.filter((p) => p.strategyCount === 0);
  const clients = allProjects.filter((p) => p.strategyCount > 0);

  return (
    <SectionShell
      title="Prospects"
      subtitle="From cold to fully configured client folder. Brand baseline → modern ICP → competitive landscape → site arch → project spin-up. Every step's deliverable doubles as a sales artifact."
    >
      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Start a new prospect
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          For now, kick off the onboarding chain by asking Hermes (the chat orb
          in the corner) — give it a name and a domain and it will run
          prospect-discovery, brand-baseline, ICP, and landscape, then save a
          new project folder.
        </p>
        <div className="rounded border border-indigo-200 bg-indigo-50 px-3 py-2">
          <code className="text-sm text-indigo-900">
            Onboard a new prospect — name &quot;Acme Roofing&quot;, domain
            acmeroofing.com
          </code>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Current prospects ({prospects.length})
        </h2>
        {prospects.length === 0 ? (
          <EmptyHint>
            No prospects in flight. Ask Hermes to onboard one above.
          </EmptyHint>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prospects.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <h3 className="font-medium text-slate-900">{p.slug}</h3>
                  {p.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    no strategy yet — onboarding in progress
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {clients.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Promoted to active client ({clients.length})
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clients.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <h3 className="font-medium text-slate-900">{p.slug}</h3>
                  <div className="text-xs text-emerald-700 mt-1">
                    active · {p.strategyCount} strateg{p.strategyCount === 1 ? "y" : "ies"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AskHermesHint
        examples={[
          "Onboard a new prospect — name 'Acme Roofing', domain acmeroofing.com",
          "Run a brand baseline assessment on Atlas Heating",
          "Generate a competitive landscape report for the radon mitigation niche",
          "Prepare me a sales call doc for Acme Roofing",
        ]}
      />
    </SectionShell>
  );
}
