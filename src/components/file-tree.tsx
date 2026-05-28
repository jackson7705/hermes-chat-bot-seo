import Link from "next/link";
import { listTree, type TreeNode } from "@/lib/omni";

function nodeUrl(projectSlug: string, node: TreeNode): string {
  // Drop the "custom/projects/<slug>/" prefix from the displayed/linked path —
  // the file viewer reads it relative to the project.
  const projectPath = `custom/projects/${projectSlug}/`;
  const sub = node.path.startsWith(projectPath)
    ? node.path.slice(projectPath.length)
    : node.path;
  return `/projects/${projectSlug}?file=${encodeURIComponent(sub)}`;
}

export function FileTree({
  projectSlug,
  relPath,
  activeFile,
  depth = 0,
}: {
  projectSlug: string;
  relPath: string;
  activeFile?: string;
  depth?: number;
}) {
  const nodes = listTree(relPath);
  if (nodes.length === 0) return null;

  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const isDir = node.type === "dir";
        const isActive =
          !!activeFile &&
          node.path === `custom/projects/${projectSlug}/${activeFile}`;
        return (
          <li key={node.path}>
            <div
              className="flex items-center gap-1.5 text-sm"
              style={{ paddingLeft: `${depth * 12}px` }}
            >
              <span className="text-slate-400 w-3 text-center text-xs">
                {isDir ? "▸" : "·"}
              </span>
              {isDir ? (
                <span className="text-slate-700 font-medium">{node.name}</span>
              ) : (
                <Link
                  href={nodeUrl(projectSlug, node)}
                  scroll={false}
                  className={`block py-0.5 px-1.5 rounded hover:bg-slate-100 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {node.name}
                </Link>
              )}
            </div>
            {isDir && (
              <FileTree
                projectSlug={projectSlug}
                relPath={node.path}
                activeFile={activeFile}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
