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

export type StrategyStep = {
  line: number;
  text: string;
  done: boolean;
};

export type StrategySummary = {
  projectSlug: string;
  strategySlug: string; // file basename minus .md
  title: string; // first H1 or filename
  totalSteps: number;
  completedSteps: number;
  percent: number; // 0..100
  nextStep: string | null; // first unchecked step text, or null if all done / none
  modifiedAt: number; // mtime seconds
};

const CHECKBOX_RE = /^\s*[-*]\s*\[( |x|X)\]\s+(.*)$/;

export function parseStrategySteps(content: string): StrategyStep[] {
  const lines = content.split("\n");
  const steps: StrategyStep[] = [];
  lines.forEach((raw, i) => {
    const m = raw.match(CHECKBOX_RE);
    if (!m) return;
    steps.push({ line: i + 1, text: m[2].trim(), done: m[1].toLowerCase() === "x" });
  });
  return steps;
}

function extractTitle(content: string, fallback: string): string {
  for (const line of content.split("\n")) {
    const m = line.match(/^#\s+(.+)$/);
    if (m) return m[1].trim();
  }
  return fallback;
}

export function listAllStrategies(): StrategySummary[] {
  const projects = listProjects();
  const out: StrategySummary[] = [];
  for (const project of projects) {
    const stratDir = safeJoin(`custom/projects/${project.slug}/strategies`);
    if (!fs.existsSync(stratDir)) continue;
    const files = fs.readdirSync(stratDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const full = path.join(stratDir, file);
      const stat = fs.statSync(full);
      const content = fs.readFileSync(full, "utf8");
      const steps = parseStrategySteps(content);
      const completed = steps.filter((s) => s.done).length;
      const slug = file.replace(/\.md$/, "");
      const title = extractTitle(content, slug);
      const nextStep = steps.find((s) => !s.done)?.text ?? null;
      out.push({
        projectSlug: project.slug,
        strategySlug: slug,
        title,
        totalSteps: steps.length,
        completedSteps: completed,
        percent: steps.length === 0 ? 0 : Math.round((completed / steps.length) * 100),
        nextStep,
        modifiedAt: Math.floor(stat.mtimeMs / 1000),
      });
    }
  }
  return out.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

export function readStrategy(
  projectSlug: string,
  strategySlug: string,
): { content: string; steps: StrategyStep[]; title: string; summary: StrategySummary } | null {
  const rel = `custom/projects/${projectSlug}/strategies/${strategySlug}.md`;
  const content = readFile(rel);
  if (content === null) return null;
  const steps = parseStrategySteps(content);
  const completed = steps.filter((s) => s.done).length;
  const title = extractTitle(content, strategySlug);
  const summary: StrategySummary = {
    projectSlug,
    strategySlug,
    title,
    totalSteps: steps.length,
    completedSteps: completed,
    percent: steps.length === 0 ? 0 : Math.round((completed / steps.length) * 100),
    nextStep: steps.find((s) => !s.done)?.text ?? null,
    modifiedAt: Math.floor(
      fs.statSync(safeJoin(rel)).mtimeMs / 1000,
    ),
  };
  return { content, steps, title, summary };
}
