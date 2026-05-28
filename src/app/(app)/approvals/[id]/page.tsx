import Link from "next/link";
import { notFound } from "next/navigation";
import { getTask, listComments } from "@/lib/kanban";
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

      <TaskActions taskId={task.id} status={task.status} />

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
