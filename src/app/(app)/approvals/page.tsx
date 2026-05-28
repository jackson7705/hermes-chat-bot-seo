import { listTasksByColumn } from "@/lib/kanban";
import { ApprovalsBoard } from "./approvals-board";

export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  const buckets = listTasksByColumn();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-8 py-10 max-w-7xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
            {today}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">
            Approvals
          </h1>
        </div>
        <p className="text-xs text-slate-400 hidden md:block">
          drag cards between columns · click to open
        </p>
      </header>

      <ApprovalsBoard buckets={buckets} />
    </div>
  );
}
