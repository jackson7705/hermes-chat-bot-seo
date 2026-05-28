import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listProjects,
  listProjectOutputs,
  readFile,
  type ProjectOutput,
} from "@/lib/omni";
import { FileTree } from "@/components/file-tree";
import { MarkdownViewer } from "@/components/markdown-viewer";

export const dynamic = "force-dynamic";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupOutputsByKind(
  outputs: ProjectOutput[],
): Record<string, ProjectOutput[]> {
  const groups: Record<string, ProjectOutput[]> = {};
  for (const o of outputs) {
    if (!groups[o.kind]) groups[o.kind] = [];
    groups[o.kind].push(o);
  }
  return groups;
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ file?: string; tab?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const project = listProjects().find((p) => p.slug === slug);
  if (!project) notFound();

  const tab = sp.tab === "outputs" ? "outputs" : "files";
  const activeFile = sp.file;
  const fileContent = activeFile
    ? readFile(`custom/projects/${slug}/${activeFile}`)
    : null;
  const isMarkdown = activeFile?.endsWith(".md") ?? false;
  const outputs = listProjectOutputs(slug);
  const groupedOutputs = groupOutputsByKind(outputs);
  const outputKinds = Object.keys(groupedOutputs).sort();

  return (
    <div className="flex h-full">
      {/* Sidebar (project nav) */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="px-4 py-3 border-b border-slate-200">
          <Link
            href="/projects"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← All clients
          </Link>
          <h2 className="text-sm font-semibold text-slate-900 mt-1 truncate">
            {project.slug}
          </h2>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-3 flex gap-1">
          <Link
            href={`/projects/${slug}?tab=files`}
            className={`flex-1 text-center text-xs rounded px-2 py-1.5 ${
              tab === "files"
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Files
          </Link>
          <Link
            href={`/projects/${slug}?tab=outputs`}
            className={`flex-1 text-center text-xs rounded px-2 py-1.5 ${
              tab === "outputs"
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Outputs ({outputs.length})
          </Link>
        </div>

        {tab === "files" ? (
          <div className="px-3 py-3">
            <FileTree
              projectSlug={slug}
              relPath={`custom/projects/${slug}`}
              activeFile={activeFile}
            />
          </div>
        ) : (
          <div className="px-3 py-3 space-y-4">
            {outputs.length === 0 ? (
              <p className="text-xs text-slate-500 px-1">
                No outputs yet. Hermes runs that produce audits, drafts, briefs, or
                reports save them to{" "}
                <code className="text-[10px]">outputs/&lt;kind&gt;/</code>.
              </p>
            ) : (
              outputKinds.map((kind) => (
                <div key={kind}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 px-1">
                    {kind}
                  </div>
                  <ul className="space-y-0.5">
                    {groupedOutputs[kind].map((output) => {
                      const isActive =
                        activeFile === `outputs/${kind}/${output.filename}`;
                      return (
                        <li key={output.filename}>
                          <Link
                            href={`/projects/${slug}?tab=outputs&file=${encodeURIComponent(
                              `outputs/${kind}/${output.filename}`,
                            )}`}
                            scroll={false}
                            className={`block py-1 px-2 rounded text-xs ${
                              isActive
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="truncate">{output.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {formatDate(output.modifiedAt)}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </aside>

      {/* Main viewer */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {!activeFile ? (
          <div className="px-8 py-10 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {project.slug}
            </h1>
            {project.description && (
              <p className="text-slate-600 mt-2">{project.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 max-w-2xl">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Strategies</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {project.strategyCount}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Outputs</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {outputs.length}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Output kinds</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {outputKinds.length}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-8">
              Pick a file from the tree, or switch to the Outputs tab to see
              audits / drafts / briefs / reports.
            </p>
          </div>
        ) : fileContent === null ? (
          <div className="px-8 py-10">
            <p className="text-slate-500">
              <span className="font-mono text-sm">{activeFile}</span> not found.
            </p>
          </div>
        ) : (
          <div className="px-8 py-8 max-w-4xl">
            <div className="text-xs text-slate-500 font-mono mb-4">
              {activeFile}
            </div>
            {isMarkdown ? (
              <MarkdownViewer source={fileContent} />
            ) : (
              <pre className="text-xs text-slate-800 whitespace-pre-wrap">
                {fileContent}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
