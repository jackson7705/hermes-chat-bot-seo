"use client";

import { useState } from "react";

export function OutputToolbar({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — fall back to manual
    }
  };

  const onPrint = () => {
    window.print();
  };

  const onDownloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const btn =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition";

  return (
    <div className="flex gap-2 no-print" data-no-print>
      <button type="button" onClick={onCopyLink} className={btn}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button type="button" onClick={onPrint} className={btn}>
        Print / PDF
      </button>
      <button type="button" onClick={onDownloadMarkdown} className={btn}>
        Download .md
      </button>
    </div>
  );
}
