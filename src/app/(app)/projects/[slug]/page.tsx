import Link from "next/link";
import { notFound } from "next/navigation";
import { listProjects, readFile } from "@/lib/omni";
import { FileTree } from "@/components/file-tree";
import { MarkdownViewer } from "@/components/markdown-viewer";

export const dynamic = "force-dynamic";

export default function ProjectPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { file?: string };
}) {
  const { slug } = params;
  const projects = listProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const activeFile = searchParams.file;
  const fileContent = activeFile
    ? readFile(`custom/projects/${slug}/${activeFile}`)
    : null;
  const isMarkdown = activeFile?.endsWith(".md") ?? false;

  return (
    <div className="flex h-full">
      {/* File tree */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="px-4 py-3 border-b border-slate-200">
          <Link
            href="/projects"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← All projects
          </Link>
          <h2 className="text-sm font-semibold text-slate-900 mt-1 truncate">
            {project.slug}
          </h2>
        </div>
        <div className="px-3 py-3">
          <FileTree
            projectSlug={slug}
            relPath={`custom/projects/${slug}`}
            activeFile={activeFile}
          />
        </div>
      </aside>

      {/* Viewer */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {!activeFile ? (
          <div className="px-8 py-10 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {project.slug}
            </h1>
            {project.description && (
              <p className="text-slate-600 mt-2">{project.description}</p>
            )}
            <p className="text-sm text-slate-500 mt-6">
              Pick a file from the tree on the left.
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
