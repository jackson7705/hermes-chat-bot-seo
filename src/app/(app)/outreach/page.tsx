import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function OutreachPage() {
  return (
    <SectionShell
      title="Outreach"
      subtitle="Link building + guest posts. End-to-end: prospect discovery → enrichment → personalised drafts → send → reply triage → placement tracking."
    >
      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Kick off outreach
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ask Hermes to run discovery and prep a campaign. Placements track in
          <code className="text-[10px] mx-1">outputs/placements/</code>;
          campaign drafts in
          <code className="text-[10px] mx-1">outputs/campaigns/</code>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Active campaigns
        </h2>
        <EmptyHint>
          No campaigns running. Ask Hermes to start one.
        </EmptyHint>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Recent placements
        </h2>
        <EmptyHint>
          No placements tracked yet.
        </EmptyHint>
      </section>

      <AskHermesHint
        examples={[
          "Find 25 broken-link prospects for air-sense in the home-improvement niche",
          "Run a citation shortlist for Atlas Heating",
          "Draft outreach emails for the prospects you just found",
          "Triage the latest outreach replies for Air Sense",
          "Confirm whether the Atlas guest post on homeguide.com is live",
        ]}
      />
    </SectionShell>
  );
}
