"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishDraftToWordPress } from "@/lib/actions";

export function PublishDraftButton({
  projectSlug,
  filename,
}: {
  projectSlug: string;
  filename: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    | null
    | { ok: true; url: string; editUrl: string; status: string }
    | { ok: false; error: string }
  >(null);

  const onPublish = (status: "draft" | "publish") => {
    setResult(null);
    if (
      status === "publish" &&
      !window.confirm(
        `Publish "${filename}" LIVE to the ${projectSlug} site? This will be visible to the public immediately.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const r = await publishDraftToWordPress(projectSlug, filename, status);
      setResult(r);
      if ("ok" in r && r.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => onPublish("draft")}
          className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-60"
        >
          {isPending ? "Publishing…" : "Publish as WP draft"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onPublish("publish")}
          className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {isPending ? "Publishing…" : "Publish LIVE"}
        </button>
      </div>
      {result && (
        <div
          className={`text-xs rounded p-2 ${
            "ok" in result && result.ok
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          {"ok" in result && result.ok ? (
            <>
              Published as <span className="font-medium">{result.status}</span>.{" "}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                View →
              </a>{" "}
              ·{" "}
              <a
                href={result.editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Edit in WP →
              </a>
            </>
          ) : (
            <>{(result as { ok: false; error: string }).error}</>
          )}
        </div>
      )}
    </div>
  );
}
