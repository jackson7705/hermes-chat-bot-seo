"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveTask,
  rejectTask,
  commentOnTask,
  requestEditsTask,
  unblockTask,
  markCompletedTask,
  flagOfficeReviewTask,
} from "@/lib/actions";
import { type Column, COLUMN_LABEL } from "@/lib/columns";

type FormKind = "reject" | "edits";

export function TaskActions({
  taskId,
  status: _status,
  column,
}: {
  taskId: string;
  status: string;
  column: Column;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [openForm, setOpenForm] = useState<FormKind | null>(null);
  const [formText, setFormText] = useState("");

  const handle = (fn: () => Promise<void>, onDone?: () => void) =>
    startTransition(async () => {
      setError(null);
      try {
        await fn();
        onDone?.();
      } catch (e) {
        setError((e as Error).message);
      }
    });

  const btn =
    "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition";
  const primary = `${btn} bg-indigo-950 text-white hover:bg-indigo-900 disabled:opacity-60`;
  const outline = `${btn} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-60`;
  const destructive = `${btn} bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-60`;
  const ghost = `${btn} text-slate-700 hover:bg-slate-100 disabled:opacity-60`;
  const secondary = `${btn} bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-60`;

  return (
    <div className="space-y-5">
      {column === "pending" && (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handle(
                  () => approveTask(taskId),
                  () => router.push("/approvals"),
                )
              }
              className={primary}
            >
              {isPending ? "Working…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setOpenForm(openForm === "edits" ? null : "edits")}
              className={outline}
            >
              Request edits
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setOpenForm(openForm === "reject" ? null : "reject")}
              className={outline}
            >
              Reject
            </button>
          </div>

          {openForm && (
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <label
                htmlFor="form-text"
                className="text-sm font-medium text-slate-700 block"
              >
                {openForm === "reject"
                  ? "Reason for rejection"
                  : "What needs to change?"}{" "}
                <span className="text-slate-400">
                  (
                  {openForm === "reject"
                    ? "optional"
                    : "be specific so Hermes can address it"}
                  )
                </span>
              </label>
              <textarea
                id="form-text"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    isPending || (openForm === "edits" && !formText.trim())
                  }
                  onClick={() =>
                    handle(
                      () =>
                        openForm === "reject"
                          ? rejectTask(taskId, formText)
                          : requestEditsTask(taskId, formText),
                      () => router.push("/approvals"),
                    )
                  }
                  className={openForm === "reject" ? destructive : primary}
                >
                  {isPending
                    ? "Working…"
                    : openForm === "reject"
                      ? "Confirm reject"
                      : "Send back for edits"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setOpenForm(null);
                    setFormText("");
                  }}
                  className={ghost}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {column === "edits" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 space-y-3">
          <p className="text-sm text-amber-900">
            This task is awaiting edits. Once Hermes (or whoever) addresses the
            request, unblock it to send it back for re-review.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              handle(
                () => unblockTask(taskId),
                () => router.push("/approvals"),
              )
            }
            className={outline}
          >
            {isPending ? "Working…" : "Unblock — send back for review"}
          </button>
        </div>
      )}

      {column === "approved" && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 space-y-3 text-sm text-indigo-900">
          <p>
            Approved — executor will process this within ~5 minutes. You can
            also force a terminal state if you don&apos;t want to wait:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handle(
                  () =>
                    markCompletedTask(taskId, "(marked complete manually)"),
                  () => router.push("/approvals"),
                )
              }
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Mark completed
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handle(
                  () =>
                    flagOfficeReviewTask(taskId, "(flagged manually)"),
                  () => router.push("/approvals"),
                )
              }
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-60"
            >
              Flag for office review
            </button>
          </div>
        </div>
      )}

      {column === "officeReview" && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 space-y-3 text-sm text-orange-900">
          <p>
            Flagged for office review. After you&apos;ve addressed the rule or
            regulation that fired, choose where this lands:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handle(
                  () =>
                    markCompletedTask(
                      taskId,
                      "(office review passed — marked complete)",
                    ),
                  () => router.push("/approvals"),
                )
              }
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Office review passed — mark completed
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handle(
                  () => rejectTask(taskId, "(failed office review)"),
                  () => router.push("/approvals"),
                )
              }
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-60"
            >
              Failed review — deny
            </button>
          </div>
        </div>
      )}

      {column === "completed" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Completed. Artifacts are listed above. This card is terminal.
        </div>
      )}

      {column === "denied" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This item has been resolved (
          <span className="font-medium">{COLUMN_LABEL[column]}</span>).
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-slate-200">
        <label
          htmlFor="comment"
          className="text-sm font-medium text-slate-700 block"
        >
          Add a comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Notes or context for the team…"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="button"
          disabled={isPending || !comment.trim()}
          onClick={() =>
            handle(
              () => commentOnTask(taskId, comment),
              () => {
                setComment("");
                router.refresh();
              },
            )
          }
          className={secondary}
        >
          {isPending ? "Adding…" : "Add comment"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
