import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function AuthorityPage() {
  return (
    <SectionShell
      title="Authority Network"
      subtitle="For clients where one money site isn't enough. Multi-site satellite roster + deployment + Tier-2 amplification. Premium tier."
    >
      <section className="mb-8 rounded-lg border border-amber-300 bg-amber-50/60 p-5">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
          Premium tier
        </div>
        <p className="text-sm text-amber-900 mt-1.5">
          Satellite Networks require leadership sign-off on roster + budget
          before Hermes provisions anything.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Active networks
        </h2>
        <EmptyHint>
          No active satellite networks. This is a premium-tier capability.
        </EmptyHint>
      </section>

      <AskHermesHint
        examples={[
          "Score candidate satellite domains for Atlas Heating with a $5K budget cap",
          "What would a satellite roster look like for the radon-mitigation niche?",
          "Show me the link-equity flow for Air Sense's existing properties",
        ]}
      />
    </SectionShell>
  );
}
