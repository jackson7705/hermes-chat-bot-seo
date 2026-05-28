import Database from "better-sqlite3";
import {
  type Column,
  type KanbanTask,
  taskToColumn,
  COLUMN_ORDER,
} from "./columns";

export type { KanbanTask } from "./columns";

const DB_PATH =
  process.env.KANBAN_DB_PATH ??
  "/opt/kanban/boards/approvals/kanban.db";

export type KanbanComment = {
  id: number;
  task_id: string;
  author: string;
  body: string;
  created_at: number;
};

let dbInstance: Database.Database | null = null;
function db(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH, { fileMustExist: true });
  }
  return dbInstance;
}

const TASK_COLS =
  "id, title, body, status, assignee, priority, created_by, created_at, idempotency_key";

/**
 * Pull tasks plus, for each, the most recent comment authored by
 * `hermes-executor`. We use the executor comment to subdivide "done"
 * status into Completed / Office Review / Approved-with-badge buckets.
 */
export function listAllTasks(): KanbanTask[] {
  const sql = `SELECT ${TASK_COLS},
                      (SELECT c.body FROM task_comments c
                       WHERE c.task_id = tasks.id
                         AND c.author = 'hermes-executor'
                       ORDER BY c.created_at DESC
                       LIMIT 1) AS latestExecutorComment
               FROM tasks
               ORDER BY priority DESC, created_at ASC`;
  return db().prepare(sql).all() as KanbanTask[];
}

export function listTasksByColumn(): Record<Column, KanbanTask[]> {
  const buckets: Record<Column, KanbanTask[]> = {
    pending: [],
    approved: [],
    officeReview: [],
    completed: [],
    denied: [],
    edits: [],
  };
  for (const task of listAllTasks()) {
    buckets[taskToColumn(task.status, task.latestExecutorComment)].push(task);
  }
  return buckets;
}

export function getTask(id: string): KanbanTask | null {
  const sql = `SELECT ${TASK_COLS},
                      (SELECT c.body FROM task_comments c
                       WHERE c.task_id = tasks.id
                         AND c.author = 'hermes-executor'
                       ORDER BY c.created_at DESC
                       LIMIT 1) AS latestExecutorComment
               FROM tasks WHERE id = ?`;
  return (db().prepare(sql).get(id) as KanbanTask | undefined) ?? null;
}

export function listComments(taskId: string): KanbanComment[] {
  const sql = `SELECT id, task_id, author, body, created_at
               FROM task_comments
               WHERE task_id = ?
               ORDER BY created_at ASC`;
  return db().prepare(sql).all(taskId) as KanbanComment[];
}

export { COLUMN_ORDER };
