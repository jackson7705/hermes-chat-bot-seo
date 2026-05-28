import { SectionShell, AskHermesHint, EmptyHint } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function LocalSeoPage() {
  return (
    <SectionShell
      title="Local SEO"
      subtitle="Service-area + multi-location work. Geographic page hierarchies, single-location pages at scale, review acquisition."
    >
      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Plan local SEO work
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Hermes designs the geo hierarchy, generates a location page per city,
          and stages everything for review before publish.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Active multi-location work
        </h2>
        <EmptyHint>
          No multi-location work in flight. Ask Hermes to start.
        </EmptyHint>
      </section>

      <AskHermesHint
        examples={[
          "Design the geo hierarchy for Atlas Heating across St. Louis County, St. Charles County, Jefferson County",
          "Generate location pages for the 12 zip codes Air Sense serves",
          "What's the review-acquisition plan for Atlas?",
          "Draft a service-area page for Air Sense focused on Chesterfield, MO",
        ]}
      />
    </SectionShell>
  );
}
