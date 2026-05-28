import Link from "next/link";
import { notFound } from "next/navigation";
import { getTask, listComments } from "@/lib/kanban";
import {
  parseArtifacts,
  taskToColumn,
  COLUMN_LABEL,
} from "@/lib/columns";
import { TaskActions } from "./task-actions";

export const dynamic = "force-dynamic";

function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const task = getTask(params.id);
  if (!task) notFound();
  const comments = listComments(params.id);

  return (
    <div className="px-8 py-10 max-w-3xl">
      <Link
        href="/approvals"
        className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
      >
        ← Approvals
      </Link>

      <header className="mt-6 mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="font-mono">{task.id}</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{task.status}</span>
          {task.created_by && (
            <>
              <span aria-hidden>·</span>
              <span>created by {task.created_by}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{formatTimestamp(task.created_at)}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {task.title}
        </h1>
      </header>

      {task.body && (
        <div className="mb-10 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {task.body}
        </div>
      )}

      {/* Artifacts panel — shown when the executor (or a manual override)
          recorded a "Completed: … Artifacts: …" comment. */}
      {taskToColumn(task.status, task.latestExecutorComment) ===
        "completed" && (() => {
        const { summary, artifacts } = parseArtifacts(
          task.latestExecutorComment,
        );
        return (
          <section className="mb-10 rounded-lg border border-emerald-300 bg-emerald-50/60 p-5">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
              Completed
            </div>
            {summary && (
              <p className="text-sm text-emerald-900 mt-2">{summary}</p>
            )}
            {artifacts.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-emerald-800 mb-1">
                  Artifacts
                </div>
                <ul className="space-y-1">
                  {artifacts.map((a, i) => (
                    <li key={i} className="text-sm">
                      {a.href ? (
                        <a
                          href={a.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 underline-offset-2 hover:underline break-all"
                        >
                          {a.label}
                        </a>
                      ) : (
                        <span className="text-emerald-900 break-all">
                          {a.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })()}

      {/* Office Review panel — when executor flagged a rule / regulation. */}
      {taskToColumn(task.status, task.latestExecutorComment) ===
        "officeReview" && (
        <section className="mb-10 rounded-lg border border-orange-300 bg-orange-50/60 p-5">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-orange-700">
            Office review needed
          </div>
          <p className="text-sm text-orange-900 mt-2 whitespace-pre-wrap">
            {task.latestExecutorComment?.replace(/^Office review needed:\s*/, "")}
          </p>
        </section>
      )}

      <TaskActions
        taskId={task.id}
        status={task.status}
        column={taskToColumn(task.status, task.latestExecutorComment)}
      />

      {comments.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">
            Activity
          </h2>
          <ul className="space-y-5">
            {comments.map((c) => (
              <li key={c.id} className="text-sm">
                <div className="text-slate-500 text-xs mb-1">
                  <span className="font-medium text-slate-700">{c.author}</span>
                  <span aria-hidden> · </span>
                  <span>{formatTimestamp(c.created_at)}</span>
                </div>
                <div className="whitespace-pre-wrap text-slate-700">{c.body}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
