"use server";

import { revalidatePath } from "next/cache";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
