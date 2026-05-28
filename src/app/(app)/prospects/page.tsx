import { listProcesses, listMethodologies } from "@/lib/omni";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function ProspectsPage() {
  const engagement = listProcesses().filter((p) => p.area === "client-engagement");
  const research = listProcesses().filter((p) => p.area === "research");
  const strategy = listMethodologies().filter((m) =>
    [
      "brand-baseline-assessment",
      "modern-icp",
      "target-market-landscape",
      "ai-era-seo-client-conversation",
      "project-config-foundation",
    ].includes(m.slug),
  );

  return (
    <SectionShell
      title="Prospects"
      capability="Capability 01 — Stand Up A New Client Engagement"
      subtitle="From cold to fully configured project folder in one workflow. Discovery → brand baseline → modern ICP → competitive landscape → site architecture → project spin-up. Each step has an omni process that produces a deliverable that doubles as a sales artifact."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Onboarding pipeline (in order)
        </h2>
        <ProcessGrid kind="processes" entries={engagement} />
      </section>

      <section className="mb-10">
        <PlaceholderRunButton
          label="Start a new prospect"
          why="Triggering the pipeline prompts you for the prospect name + domain, runs prospect-discovery, kicks off brand-baseline-assessment, and ends with project-config-generation. The result is a new entry under custom/projects/<slug>/ ready for strategy work."
        />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Discovery + research processes
        </h2>
        <ProcessGrid kind="processes" entries={research} />
      </section>

      {strategy.length > 0 && (
        <section className="mt-10 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Underlying methodology
          </h2>
          <ProcessGrid kind="methodologies" entries={strategy} />
        </section>
      )}
    </SectionShell>
  );
}
