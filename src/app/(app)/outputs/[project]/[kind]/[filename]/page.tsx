import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "@/lib/omni";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { OutputToolbar } from "@/components/output-toolbar";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  audits: "Audit",
  drafts: "Draft",
  refreshes: "Refresh proposal",
  briefs: "Brief",
  reports: "Report",
  campaigns: "Campaign",
  placements: "Placement record",
};

const KIND_BACKLINKS: Record<string, { href: string; label: string }> = {
  audits: { href: "/audits", label: "← Audits" },
  drafts: { href: "/content", label: "← Content" },
  refreshes: { href: "/content", label: "← Content" },
  briefs: { href: "/content", label: "← Content" },
  reports: { href: "/reports", label: "← Reports" },
  campaigns: { href: "/outreach", label: "← Outreach" },
  placements: { href: "/outreach", label: "← Outreach" },
};

function extractTitle(content: string, fallback: string): string {
  for (const line of content.split("\n")) {
    const m = line.match(/^#\s+(.+)$/);
    if (m) return m[1].trim();
  }
  return fallback;
}

export default async function OutputPage({
  params,
}: {
  params: Promise<{ project: string; kind: string; filename: string }>;
}) {
  const { project, kind, filename } = await params;
  const decodedFilename = decodeURIComponent(filename);
  const relPath = `custom/projects/${project}/outputs/${kind}/${decodedFilename}`;
  const content = readFile(relPath);
  if (!content) notFound();

  const title = extractTitle(content, decodedFilename.replace(/\.md$/, ""));
  const kindLabel = KIND_LABELS[kind] ?? kind;
  const backlink = KIND_BACKLINKS[kind] ?? {
    href: `/projects/${project}`,
    label: "← Client",
  };

  // Strip the H1 from the body so we don't render the title twice (the page
  // header has it large at top).
  const bodyLines = content.split("\n");
  let firstH1 = -1;
  for (let i = 0; i < bodyLines.length; i++) {
    if (/^#\s+/.test(bodyLines[i])) {
      firstH1 = i;
      break;
    }
  }
  const body =
    firstH1 >= 0 ? bodyLines.slice(firstH1 + 1).join("\n").trim() : content;

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto document-print">
      {/* Header — hidden on print */}
      <header className="no-print mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={backlink.href}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {backlink.label}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {kindLabel}
            </span>
            <span aria-hidden>·</span>
            <Link
              href={`/projects/${project}`}
              className="hover:text-slate-700"
            >
              {project}
            </Link>
            <span aria-hidden>·</span>
            <code className="font-mono text-[11px] text-slate-400 truncate">
              {decodedFilename}
            </code>
          </div>
        </div>
        <OutputToolbar filename={decodedFilename} content={content} />
      </header>

      {/* Document */}
      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6">
          {title}
        </h1>
        <MarkdownViewer source={body} />
      </article>
    </div>
  );
}
