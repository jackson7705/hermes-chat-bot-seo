"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitProcessRun } from "@/lib/actions";

export type ProcessOption = {
  slug: string;
  title: string;
  path: string; // relative omni path to the process .md
  outputKind: string;
};

export type ProjectOption = { slug: string; label: string };

export function RunProcessForm({
  ctaLabel,
  ctaSubmitting,
  projects,
  processes,
  successHint,
}: {
  ctaLabel: string; // e.g. "Run audit"
  ctaSubmitting: string; // e.g. "Submitting…"
  projects: ProjectOption[];
  processes: ProcessOption[];
  successHint: string; // e.g. "Audit queued — Hermes is on it. Output appears below in a few minutes."
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projectSlug, setProjectSlug] = useState("");
  const [processSlug, setProcessSlug] = useState("");
  const [status, setStatus] = useState<
    | null
    | { ok: true; msg: string; taskId: string | null }
    | { ok: false; msg: string }
  >(null);

  // Auto-refresh while a run is in flight so the new output appears on the
  // page when the executor completes (typically 1-4 minutes).
  useEffect(() => {
    if (!status?.ok) return;
    const id = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(id);
  }, [status, router]);

  const proc = processes.find((p) => p.slug === processSlug);
  const project = projects.find((p) => p.slug === projectSlug);

  const onSubmit = () => {
    if (!proc || !project) return;
    setStatus(null);
    startTransition(async () => {
      try {
        const res = await submitProcessRun(
          project.slug,
          proc.path,
          proc.outputKind,
          proc.slug,
          proc.title,
        );
        setStatus({
          ok: true,
          msg: successHint,
          taskId: res.taskId,
        });
        // Reset for next run
        setProjectSlug("");
        setProcessSlug("");
      } catch (e) {
        setStatus({ ok: false, msg: (e as Error).message || "Submit failed" });
      }
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium block mb-1 text-slate-700">
            Client
          </label>
          <select
            value={projectSlug}
            onChange={(e) => setProjectSlug(e.target.value)}
            disabled={isPending}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 bg-white"
          >
            <option value="">Pick a client…</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1 text-slate-700">
            Process
          </label>
          <select
            value={processSlug}
            onChange={(e) => setProcessSlug(e.target.value)}
            disabled={isPending}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 bg-white"
          >
            <option value="">Pick a process…</option>
            {processes.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        disabled={isPending || !projectSlug || !processSlug}
        onClick={onSubmit}
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-indigo-950 text-white hover:bg-indigo-900 disabled:opacity-60"
      >
        {isPending ? ctaSubmitting : ctaLabel}
      </button>
      {status && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            status.ok
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          {status.msg}
          {status.ok && status.taskId && (
            <>
              {" "}
              <Link
                href={`/approvals/${status.taskId}`}
                className="underline underline-offset-2 hover:no-underline"
              >
                View task →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
