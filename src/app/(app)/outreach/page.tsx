import { listProcesses, listMethodologies, listSkills } from "@/lib/omni";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function OutreachPage() {
  const linkProcesses = listProcesses().filter((p) =>
    [
      "prospect-discovery",
      "citation-shortlist-discovery",
      "outreach-campaign-run",
      "reply-triage",
      "placement-tracker",
      "guest-post-fulfillment",
    ].includes(p.slug),
  );
  const setupProcesses = listProcesses().filter((p) => p.area === "setup");
  const methodology = listMethodologies().filter((m) =>
    [
      "link-building-criteria",
      "link-outreach-prospecting",
      "link-outreach-reply-handling",
      "cold-email-deliverability",
      "guest-post-content-strategy",
      "link-investment-estimation",
      "citation-shortlist-targeting",
    ].includes(m.slug),
  );
  const skills = listSkills().filter((s) =>
    ["guest-post-brief-writer", "link-investment-estimator"].includes(s.slug),
  );

  return (
    <SectionShell
      title="Outreach"
      capability="Capability 07 — Link Building & Outreach At Scale"
      subtitle="End-to-end prospecting through link verification. 5 prospect-discovery modes · citation shortlist targeting · auto-filter low-quality prospects · contact enrichment · campaign delivery · reply triage · placement tracker. Guest post fulfillment included."
    >
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Pipeline processes
        </h2>
        <ProcessGrid kind="processes" entries={linkProcesses} />
      </section>

      <section className="mb-10">
        <PlaceholderRunButton
          label="Start an outreach campaign"
          why="Set discovery mode (broken-link / gap / niche / citation / topical) + a target project. Hermes runs prospect discovery, enriches contacts, drafts personalised outreach, sends through Smartlead/Resend, classifies replies, and updates the placement tracker as links go live."
        />
      </section>

      {setupProcesses.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Prerequisite setup
          </h2>
          <ProcessGrid kind="processes" entries={setupProcesses} />
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Generation + analysis skills
          </h2>
          <ProcessGrid kind="skills" entries={skills} />
        </section>
      )}

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
