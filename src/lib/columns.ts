// Pure utilities for mapping a Hermes kanban task onto one of the six
// platform columns. NO database access here — both server and client
// components import from this file (the client can't pull in better-sqlite3).

export type KanbanTask = {
  id: string;
  title: string;
  body: string | null;
  status: string;
  assignee: string | null;
  priority: number;
  created_by: string | null;
  created_at: number; // unix seconds
  idempotency_key: string | null;
  /**
   * Most-recent comment authored by `hermes-executor`. Used together with
   * status to decide which column the task belongs in (Completed vs Office
   * Review vs Approved-with-badge).
   */
  latestExecutorComment?: string | null;
};

export type Column =
  | "pending"
  | "approved"
  | "officeReview"
  | "completed"
  | "denied"
  | "edits";

export const COLUMN_ORDER: Column[] = [
  "pending",
  "approved",
  "officeReview",
  "completed",
  "denied",
  "edits",
];

export const COLUMN_LABEL: Record<Column, string> = {
  pending: "Pending",
  approved: "Approved",
  officeReview: "Office Review",
  completed: "Completed",
  denied: "Denied",
  edits: "Needs edits",
};

export const COLUMN_DESCRIPTION: Record<Column, string> = {
  pending: "Needs human approval",
  approved: "Executor processing",
  officeReview: "Rule or regulation flagged — needs review",
  completed: "Done with artifacts",
  denied: "Rejected",
  edits: "Sent back for revision",
};

/**
 * Hermes's kanban DB uses these status values:
 *   ready / in_progress / triage  →  Pending
 *   done                          →  Approved / Completed / Office Review
 *                                    (further subdivided by the latest
 *                                    hermes-executor comment prefix)
 *   archived                      →  Denied
 *   blocked                       →  Needs edits
 */
export function taskToColumn(
  status: string,
  latestExecutorComment?: string | null,
): Column {
  switch (status) {
    case "archived":
      return "denied";
    case "blocked":
      return "edits";
    case "done": {
      const c = latestExecutorComment ?? "";
      // "Executed:" is the legacy prefix from earlier executor runs — treat
      // it the same as "Completed:" so cards from prior days land correctly.
      if (c.startsWith("Completed:") || c.startsWith("Executed:"))
        return "completed";
      if (c.startsWith("Office review needed:")) return "officeReview";
      // "Blocked: …" and "Unknown action type" both stay in Approved (with a
      // visible badge on the card). They represent infra/scope problems, not
      // workflow stages.
      return "approved";
    }
    default:
      return "pending";
  }
}

/** Badge text for an Approved card based on executor comment, or null. */
export function approvedBadge(
  latestExecutorComment?: string | null,
): { label: string; tone: "warning" | "info" } | null {
  const c = latestExecutorComment ?? "";
  if (c.startsWith("Blocked:")) {
    // Pull the reason after "Blocked:" up to ~30 chars
    const reason = c.slice("Blocked:".length).trim().slice(0, 40);
    return { label: `blocked · ${reason}`, tone: "warning" };
  }
  if (c.startsWith("Unknown action type")) {
    return { label: "needs definition", tone: "info" };
  }
  return null;
}

/** Parse the Artifacts: line of a Completed: comment into clickable items. */
export function parseArtifacts(
  latestExecutorComment?: string | null,
): { summary: string; artifacts: { label: string; href?: string }[] } {
  const c = latestExecutorComment ?? "";
  let body: string;
  if (c.startsWith("Completed:")) {
    body = c.slice("Completed:".length).trim();
  } else if (c.startsWith("Executed:")) {
    // Legacy prefix from the first executor run — same shape, just an older
    // verb.
    body = c.slice("Executed:".length).trim();
  } else {
    return { summary: "", artifacts: [] };
  }
  // Split body by "Artifacts:" marker. Everything before is the summary,
  // everything after is a list of artifacts (comma- or newline-separated).
  const m = body.split(/\s*Artifacts:\s*/i);
  const summary = (m[0] ?? "").trim();
  const rest = (m[1] ?? "").trim();
  if (!rest) return { summary, artifacts: [] };
  const items = rest
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const artifacts = items.map((item) => {
    // Recognize URLs and file paths
    const urlMatch = item.match(/https?:\/\/\S+/);
    if (urlMatch) {
      return { label: item, href: urlMatch[0] };
    }
    return { label: item };
  });
  return { summary, artifacts };
}
