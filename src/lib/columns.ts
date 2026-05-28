// Pure utilities for mapping a Hermes kanban task status onto one of four
// platform columns. No DB access here — both server and client components
// import from this file (the client can't pull in better-sqlite3).

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
};

export type Column = "pending" | "approved" | "denied" | "edits";

export const COLUMN_ORDER: Column[] = [
  "pending",
  "approved",
  "denied",
  "edits",
];

export const COLUMN_LABEL: Record<Column, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  edits: "Needs edits",
};

export function statusToColumn(status: string): Column {
  // Hermes's kanban DB uses these status values:
  //   ready / in_progress / triage  →  Pending (waiting on a human)
  //   done                          →  Approved (the kanban CLI command is
  //                                    `complete` but the stored status is
  //                                    `done` — easy to get wrong)
  //   archived                      →  Denied
  //   blocked                       →  Needs edits
  switch (status) {
    case "done":
      return "approved";
    case "archived":
      return "denied";
    case "blocked":
      return "edits";
    default:
      return "pending";
  }
}
