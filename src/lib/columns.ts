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
  switch (status) {
    case "completed":
      return "approved";
    case "archived":
      return "denied";
    case "blocked":
      return "edits";
    default:
      return "pending";
  }
}
