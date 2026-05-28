import { listMethodologies } from "@/lib/omni";
import { SectionShell, ProcessGrid, PlaceholderRunButton } from "@/components/section-shell";

export const dynamic = "force-dynamic";

export default function LocalSeoPage() {
  const methodology = listMethodologies().filter((m) =>
    [
      "local-landing-page-anatomy",
      "geographic-page-hierarchy",
      "review-acquisition",
      "service-page-positioning",
      "single-point-of-conversion",
    ].includes(m.slug),
  );

  return (
    <SectionShell
      title="Local SEO"
      capability="Capability 09 — Local & Multi-Location SEO"
      subtitle="Directly relevant to home-services accounts. Geographic page hierarchy design · single-location-page writer scaled across N locations · local landing page anatomy baked into every page · review acquisition methodology."
    >
      <section className="mb-10">
        <PlaceholderRunButton
          label="Generate multi-location page set"
          why="Pick a service-area client + a list of locations. Hermes designs the geo hierarchy, drafts a location page per city (or zip) using the local-landing-page-anatomy methodology, and stages everything for review before publish. Variants for single-location and multi-location service businesses."
        />
      </section>

      {methodology.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Underlying methodology
          </h2>
          <ProcessGrid kind="methodologies" entries={methodology} />
        </section>
      )}
    </SectionShell>
  );
}
