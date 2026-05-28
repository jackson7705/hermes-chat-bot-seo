import { listProcesses, listMethodologies } from "@/lib/omni";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function AuthorityPage() {
  const processes = listProcesses().filter(
    (p) =>
      p.area === "deployment" ||
      p.slug === "tier-2-amplification-trigger",
  );
  const methodology = listMethodologies().filter(
    (m) =>
      m.area === "architecture" &&
      [
        "asn-roster-selection",
        "authority-satellite-network-deployment",
        "link-equity-management",
      ].includes(m.slug),
  );

  return (
    <SectionShell
      title="Authority Network"
      capability="Capability 08 — Authority Satellite Network (Multi-Site)"
      subtitle="For clients where one money site isn't enough. Selects a satellite roster, deploys the satellites, manages link-equity flow, and triggers Tier-2 amplification when the network's ready. Premium-tier capability."
    >
      <section className="mb-10 rounded-lg border border-amber-300 bg-amber-50/60 p-5">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
          Premium tier
        </div>
        <p className="text-sm text-amber-900 mt-1.5">
          Authority Satellite Network deployments are reserved for premium accounts.
          Leadership signs off on roster + budget before the agent provisions
          satellites or starts producing satellite content.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Deployment + amplification processes
        </h2>
        <ProcessGrid kind="processes" entries={processes} />
      </section>

      <section className="mb-10">
        <PlaceholderRunButton
          label="Provision a satellite network"
          why="Pick a premium client + budget cap. Hermes scores candidate satellite domains, presents a proposed roster for approval, then deploys each satellite (DNS, hosting, theme, opening content set) and ties link equity back to the money site per the link-equity methodology."
        />
      </section>

      {methodology.length > 0 && (
        <section className="mt-10 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Underlying architecture methodology
          </h2>
          <ProcessGrid kind="methodologies" entries={methodology} />
        </section>
      )}
    </SectionShell>
  );
}
