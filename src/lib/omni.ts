import fs from "node:fs";
import path from "node:path";

// Root of the omni corpus inside the container. In production this is a
// bind-mount of /docker/hermes-agent-p6xk/data/omni from the host.
const OMNI_ROOT = process.env.OMNI_ROOT ?? "/opt/omni";

export type ProjectSummary = {
  slug: string;
  description: string | null;
  strategyCount: number;
};

export type TreeNode = {
  name: string;
  path: string; // relative to OMNI_ROOT
  type: "file" | "dir";
};

function safeJoin(relative: string): string {
  // Defence in depth: refuse path traversal. The /api/chat etc. surfaces also
  // pass user-controlled segments here.
  const resolved = path.resolve(OMNI_ROOT, relative);
  if (!resolved.startsWith(path.resolve(OMNI_ROOT))) {
    throw new Error("path escapes omni root");
  }
  return resolved;
}

export function listProjects(): ProjectSummary[] {
  const projectsDir = safeJoin("custom/projects");
  if (!fs.existsSync(projectsDir)) return [];
  const entries = fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  return entries.map((e) => {
    const slug = e.name;
    const readme = path.join(projectsDir, slug, "README.md");
    let description: string | null = null;
    if (fs.existsSync(readme)) {
      try {
        const raw = fs.readFileSync(readme, "utf8");
        // First non-frontmatter, non-heading paragraph
        const lines = raw.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("#")) continue;
          if (trimmed.startsWith("---")) continue;
          if (trimmed.startsWith(">")) {
            description = trimmed.replace(/^>\s*/, "").slice(0, 200);
            break;
          }
          description = trimmed.slice(0, 200);
          break;
        }
      } catch {
        // ignore
      }
    }
    const stratDir = path.join(projectsDir, slug, "strategies");
    let strategyCount = 0;
    if (fs.existsSync(stratDir)) {
      strategyCount = fs
        .readdirSync(stratDir)
        .filter((f) => f.endsWith(".md")).length;
    }
    return { slug, description, strategyCount };
  });
}

export function listTree(relPath: string): TreeNode[] {
  const dir = safeJoin(relPath);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((e) => ({
      name: e.name,
      path: path.join(relPath, e.name),
      type: e.isDirectory() ? "dir" : "file",
    }));
}

export function readFile(relPath: string): string | null {
  const full = safeJoin(relPath);
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
  return fs.readFileSync(full, "utf8");
}
