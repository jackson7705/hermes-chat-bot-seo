"use server";

import { revalidatePath } from "next/cache";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile, readProjectEnv } from "@/lib/omni";
import { marked } from "marked";

const execFileAsync = promisify(execFile);

const HERMES_CONTAINER =
  process.env.HERMES_CONTAINER ?? "hermes-agent-p6xk-hermes-agent-1";
const KANBAN_BOARD = process.env.KANBAN_BOARD ?? "approvals";

async function hermesKanban(args: string[]): Promise<string> {
  const fullArgs = [
    "exec",
    "-u",
    "hermes",
    HERMES_CONTAINER,
    "hermes",
    "kanban",
    "--board",
    KANBAN_BOARD,
    ...args,
  ];
  try {
    const { stdout } = await execFileAsync("docker", fullArgs, {
      timeout: 30_000,
    });
    return stdout;
  } catch (err) {
    const e = err as { stderr?: string; message: string };
    throw new Error(
      `hermes kanban ${args.join(" ")} failed: ${e.stderr || e.message}`,
    );
  }
}

async function requireUserEmail(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Not signed in");
  return session.user.email;
}

export async function approveTask(taskId: string): Promise<void> {
  const email = await requireUserEmail();
  await hermesKanban([
    "comment",
    "--author",
    email,
    taskId,
    `Approved by ${email}. → Hermes: execute the action described in the task body. Read the body with \`hermes kanban --board approvals show ${taskId}\` and run the listed ON APPROVE steps. Post a kanban comment summarizing what you did and any artifacts produced.`,
  ]);
  await hermesKanban(["complete", taskId]);
  revalidatePath("/approvals");
  revalidatePath(`/approvals/${taskId}`);
}

export async function rejectTask(
  taskId: string,
  reason: string,
): Promise<void> {
  const email = await requireUserEmail();
  const reasonText = reason.trim() || "(no reason given)";
  await hermesKanban([
    "comment",
    "--author",
    email,
    taskId,
    `Rejected by ${email}: ${reasonText}. → Hermes: acknowledge. Consider whether the rejection reason suggests a strategy-file change in the source omni project; if so, surface that as a fresh kanban task with the proposed edit.`,
  ]);
  await hermesKanban(["archive", taskId]);
  revalidatePath("/approvals");
  revalidatePath(`/approvals/${taskId}`);
}

export async function commentOnTask(
  taskId: string,
  body: string,
): Promise<void> {
  const email = await requireUserEmail();
  const text = body.trim();
  if (!text) throw new Error("Comment cannot be empty");
  await hermesKanban(["comment", "--author", email, taskId, text]);
  revalidatePath(`/approvals/${taskId}`);
}

export async function requestEditsTask(
  taskId: string,
  reason: string,
): Promise<void> {
  const email = await requireUserEmail();
  const reasonText = reason.trim() || "(no specifics given)";
  await hermesKanban([
    "comment",
    "--author",
    email,
    taskId,
    `Requested edits by ${email}: ${reasonText}. → Hermes: revise the task body to address this feedback. When done, post a comment summarizing what changed and call \`hermes kanban --board approvals unblock ${taskId}\` to send back for re-review.`,
  ]);
  await hermesKanban(["block", taskId, reasonText]);
  revalidatePath("/approvals");
  revalidatePath(`/approvals/${taskId}`);
}

export async function unblockTask(taskId: string): Promise<void> {
  const email = await requireUserEmail();
  await hermesKanban([
    "comment",
    "--author",
    email,
    taskId,
    `Unblocked by ${email} — revision complete, queued for re-review. → Hermes: no action needed; awaiting human re-review.`,
  ]);
  await hermesKanban(["unblock", taskId]);
  revalidatePath("/approvals");
  revalidatePath(`/approvals/${taskId}`);
}

/**
 * Manual override: mark a task fully complete without the executor.
 * Writes a `hermes-executor`-authored "Completed: …" comment so the
 * column-mapper puts it in the Completed bucket. Also marks status=done if
 * the task isn't already there.
 */
export async function markCompletedTask(
  taskId: string,
  note: string,
): Promise<void> {
  const email = await requireUserEmail();
  const text = note.trim() || "(no notes)";
  await hermesKanban([
    "comment",
    "--author",
    "hermes-executor",
    taskId,
    `Completed: ${text} Artifacts: (none captured — marked complete manually by ${email})`,
  ]);
  // No-op if already done; idempotent.
  try {
    await hermesKanban(["complete", taskId]);
  } catch {
    /* already complete is fine */
  }
  revalidatePath("/approvals");
  revalidatePath(`/approvals/${taskId}`);
}

/**
 * Publish a draft markdown file to the project's WordPress site.
 *
 * Reads /opt/data/omni/custom/projects/<slug>/outputs/drafts/<filename>.md,
 * extracts the H1 as the title, converts the body to HTML, and POSTs to
 * <WP_URL>/wp-json/wp/v2/posts with HTTP basic auth from the project's
 * .env. Defaults to publishStatus="draft" so the operator can review in
 * WP admin before the post goes live.
 *
 * Returns either a clickable WP URL (preview link) + admin edit URL, or an
 * error string the UI can render inline.
 */
export async function publishDraftToWordPress(
  projectSlug: string,
  draftFilename: string,
  publishStatus: "draft" | "publish",
): Promise<
  | { ok: true; url: string; editUrl: string; status: string }
  | { ok: false; error: string }
> {
  await requireUserEmail();

  const env = readProjectEnv(projectSlug);
  if (!env.WP_URL || !env.WP_USER || !env.WP_APP_PASSWORD) {
    return {
      ok: false,
      error: `WordPress credentials missing for ${projectSlug}. Add WP_URL, WP_USER, and WP_APP_PASSWORD to custom/projects/${projectSlug}/.env on your Mac, then rsync to the VPS.`,
    };
  }

  const draftPath = `custom/projects/${projectSlug}/outputs/drafts/${draftFilename}`;
  const content = readFile(draftPath);
  if (!content) {
    return { ok: false, error: `Draft file not found: ${draftPath}` };
  }

  // Title = first H1, fallback to filename. Body = everything after the H1.
  const lines = content.split("\n");
  let titleLine = -1;
  let title = draftFilename.replace(/\.md$/, "");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)$/);
    if (m) {
      title = m[1].trim();
      titleLine = i;
      break;
    }
  }
  const bodyMarkdown =
    titleLine >= 0 ? lines.slice(titleLine + 1).join("\n") : content;
  const html = await marked.parse(bodyMarkdown.trim());

  const wpBase = env.WP_URL.replace(/\/$/, "");
  const auth = Buffer.from(
    `${env.WP_USER}:${env.WP_APP_PASSWORD}`,
  ).toString("base64");

  let res: Response;
  try {
    res = await fetch(`${wpBase}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        title,
        content: html,
        status: publishStatus,
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: `Couldn't reach WordPress at ${wpBase}: ${(err as Error).message}`,
    };
  }

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      error: `WP returned ${res.status}: ${text.slice(0, 300)}`,
    };
  }

  type WpPost = { id: number; link: string; status: string };
  const data = (await res.json()) as WpPost;
  revalidatePath("/content");
  revalidatePath(`/projects/${projectSlug}`);
  return {
    ok: true,
    url: data.link,
    editUrl: `${wpBase}/wp-admin/post.php?post=${data.id}&action=edit`,
    status: data.status,
  };
}

/**
 * Manual override: flag a task for office review (rule / regulation check).
 * Status stays `done` (it was approved by a human); the column is determined
 * by the executor-style comment we add.
 */
/**
 * Submit a "Run: <process-slug> for <project-slug>" task. Creates the kanban
 * task in done status (auto-approved — the user explicitly clicked Run), then
 * spawns the executor in the background so the work starts within seconds
 * instead of waiting for the next 5-min cron.
 *
 * The executor's executor.md handles the Run: prefix: reads the process file,
 * applies it to the project, writes the deliverable to
 *   custom/projects/<slug>/outputs/<kind>/YYYY-MM-DD-<process-slug>.md
 * and posts `Completed: …` with the artifact path so the column-mapper
 * lands it in the Completed column.
 */
export async function submitProcessRun(
  projectSlug: string,
  processPath: string, // e.g. "core/processes/analysis/aio-readiness-audit.md"
  outputKind: string, // e.g. "audits"
  processSlug: string, // e.g. "aio-readiness-audit"
  processTitle: string, // for the task title — human-readable
): Promise<{ taskId: string | null }> {
  const email = await requireUserEmail();

  const today = new Date().toISOString().slice(0, 10);
  const taskTitle = `Run: ${processSlug} for ${projectSlug}`;
  const taskBody = `${processTitle} — requested by ${email} at ${new Date().toISOString()}.

PROCESS
  Read /opt/data/omni/${processPath}
  Apply it to project ${projectSlug}.

PROJECT CONTEXT
  /opt/data/omni/custom/projects/${projectSlug}/
  (Read README.md, project-config.md, brand/, strategies/, notes.md, and rules.md if present, to inform the run.)

OUTPUT
  Save the deliverable to /opt/data/omni/custom/projects/${projectSlug}/outputs/${outputKind}/${today}-${processSlug}.md
  Use standard markdown. Lead with a one-paragraph executive summary, then the detailed findings per the process file.

ON APPROVE STEPS
  1. Read the process at /opt/data/omni/${processPath}
  2. Read the project context at /opt/data/omni/custom/projects/${projectSlug}/
  3. Apply the process — use shell tools (cat, grep, ls) freely
  4. Write the deliverable to the OUTPUT path
  5. Post a kanban comment: \`Completed: Ran ${processSlug} for ${projectSlug}. Artifacts: custom/projects/${projectSlug}/outputs/${outputKind}/${today}-${processSlug}.md\`
`;

  // Create the task
  const { stdout } = await execFileAsync("docker", [
    "exec",
    "-u",
    "hermes",
    HERMES_CONTAINER,
    "hermes",
    "kanban",
    "--board",
    KANBAN_BOARD,
    "create",
    taskTitle,
    "--body",
    taskBody,
    "--idempotency-key",
    `run:${processSlug}:${projectSlug}:${Date.now()}`,
  ]);

  const match = stdout.match(/Created\s+(t_[a-f0-9]+)/);
  const taskId = match?.[1] ?? null;

  if (taskId) {
    // Audit comment from the operator (so we know who triggered it)
    await execFileAsync("docker", [
      "exec",
      "-u",
      "hermes",
      HERMES_CONTAINER,
      "hermes",
      "kanban",
      "--board",
      KANBAN_BOARD,
      "comment",
      "--author",
      email,
      taskId,
      `Run requested by ${email}.`,
    ]);
    // Auto-approve (status=done) so the executor pre-check picks it up.
    await execFileAsync("docker", [
      "exec",
      "-u",
      "hermes",
      HERMES_CONTAINER,
      "hermes",
      "kanban",
      "complete",
      taskId,
    ]);

    // Fire the executor in the background — don't await. The detached child
    // outlives this server action so the audit runs while the form clears.
    const child = spawn(
      "docker",
      [
        "exec",
        "-d",
        "-u",
        "hermes",
        "-w",
        "/opt/data/omni",
        HERMES_CONTAINER,
        "sh",
        "/opt/data/run-executor.sh",
      ],
      { detached: true, stdio: "ignore" },
    );
    child.unref();
  }

  revalidatePath("/audits");
  revalidatePath("/approvals");
  return { taskId };
}

export async function flagOfficeReviewTask(
  taskId: string,
  reason: string,
): Promise<void> {
  const email = await requireUserEmail();
  const text = reason.trim() || "(manual flag)";
  await hermesKanban([
    "comment",
    "--author",
    "hermes-executor",
    taskId,
    `Office review needed: ${text} — flagged by ${email} for human review before any further automated action.`,
  ]);
  revalidatePath("/approvals");
  revalidatePath(`/approvals/${taskId}`);
}
