"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  approvedBadge,
  type Column,
  type KanbanTask,
} from "@/lib/columns";
import {
  approveTask,
  rejectTask,
  requestEditsTask,
  unblockTask,
  markCompletedTask,
  flagOfficeReviewTask,
} from "@/lib/actions";

function formatRelative(unix: number): string {
  const seconds = Math.floor(Date.now() / 1000 - unix);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

const COLUMN_ACCENT: Record<Column, string> = {
  pending: "border-slate-300 text-slate-900",
  approved: "border-indigo-300 text-indigo-700",
  officeReview: "border-orange-300 text-orange-700",
  completed: "border-emerald-300 text-emerald-700",
  denied: "border-rose-300 text-rose-700",
  edits: "border-amber-300 text-amber-700",
};

const COLUMN_DROP_HINT: Record<Column, string> = {
  pending: "ring-2 ring-slate-400/60",
  approved: "ring-2 ring-indigo-500/60",
  officeReview: "ring-2 ring-orange-500/60",
  completed: "ring-2 ring-emerald-500/60",
  denied: "ring-2 ring-rose-500/60",
  edits: "ring-2 ring-amber-500/60",
};

// Allowed manual transitions. Approved → Completed / Office Review / Denied
// is an OVERRIDE — normally the executor moves cards into Completed / Office
// Review by writing its categorised comment. But the operator can also force
// a move when needed.
const ALLOWED: Record<Column, Set<Column>> = {
  pending: new Set<Column>(["approved", "denied", "edits"]),
  approved: new Set<Column>(["completed", "officeReview", "denied"]),
  officeReview: new Set<Column>(["approved", "completed", "denied"]),
  edits: new Set<Column>(["pending"]),
  completed: new Set<Column>(),
  denied: new Set<Column>(),
};

function TaskCardBody({ task }: { task: KanbanTask }) {
  const badge = approvedBadge(task.latestExecutorComment);
  return (
    <>
      <h3 className="font-medium text-sm text-slate-900 leading-snug">
        {task.title}
      </h3>
      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
        <span className="font-mono">{task.id}</span>
        <span aria-hidden>·</span>
        <span>{formatRelative(task.created_at)}</span>
      </div>
      {badge && (
        <div
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
            badge.tone === "warning"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {badge.label}
        </div>
      )}
    </>
  );
}

function DraggableCard({
  task,
  sourceCol,
  busy,
}: {
  task: KanbanTask;
  sourceCol: Column;
  busy: boolean;
}) {
  const router = useRouter();
  const draggable = ALLOWED[sourceCol].size > 0 && !busy;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { sourceCol },
    disabled: !draggable,
  });

  // Track whether the mouse actually moved between pointerdown and pointerup
  // so we only navigate on real clicks, not on drag-ends. dnd-kit's pointer
  // sensor has an 8px activation distance — anything under that fires neither
  // a drag-start nor an `isDragging` state, so we'd otherwise navigate even
  // after a small mouse-down-and-release used to start a drag attempt.
  const downPos = useRef<{ x: number; y: number } | null>(null);

  const baseClasses =
    "block rounded-lg border bg-white p-4 transition-colors select-none";
  const borderClasses = isDragging
    ? "border-slate-400 opacity-30"
    : "border-slate-200 hover:border-slate-300";
  const cursorClasses = draggable
    ? "cursor-grab active:cursor-grabbing"
    : "cursor-pointer";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onPointerDownCapture={(e) => {
        downPos.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        if (isDragging) return;
        if (downPos.current) {
          const dx = e.clientX - downPos.current.x;
          const dy = e.clientY - downPos.current.y;
          if (dx * dx + dy * dy > 16) return; // > 4px movement — was a drag-attempt, not a click
        }
        router.push(`/approvals/${task.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/approvals/${task.id}`);
        }
      }}
      className={`${baseClasses} ${borderClasses} ${cursorClasses}`}
    >
      <TaskCardBody task={task} />
    </div>
  );
}

function DroppableColumn({
  col,
  tasks,
  busy,
}: {
  col: Column;
  tasks: KanbanTask[];
  busy: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${col}` });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-lg p-1 ${isOver ? COLUMN_DROP_HINT[col] : ""}`}
    >
      <header
        className={`flex items-baseline justify-between pb-2 mb-3 border-b ${COLUMN_ACCENT[col]}`}
      >
        <h2 className="text-sm font-semibold">{COLUMN_LABEL[col]}</h2>
        <span className="text-xs tabular-nums text-slate-500">
          {tasks.length}
        </span>
      </header>
      {tasks.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 px-1">
          {isOver ? "drop to move here" : "(empty)"}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <DraggableCard task={task} sourceCol={col} busy={busy} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ApprovalsBoard({
  buckets,
}: {
  buckets: Record<Column, KanbanTask[]>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Auto-refresh every 10s so autonomous changes (Hermes executor completing
  // tasks, the daily orchestrator queuing new ones) show up without the
  // operator having to hit reload. Paused while a manual transition is in
  // flight so we don't fight with the user's drag.
  useEffect(() => {
    if (isPending) return;
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [isPending, router]);

  const findTask = (id: string): KanbanTask | null => {
    for (const col of COLUMN_ORDER) {
      const found = buckets[col].find((t) => t.id === id);
      if (found) return found;
    }
    return null;
  };

  const onDragStart = (e: DragStartEvent) => {
    const task = findTask(e.active.id as string);
    setActiveTask(task);
    setError(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    if (!e.over) return;
    const sourceCol = e.active.data.current?.sourceCol as Column | undefined;
    if (!sourceCol) return;
    const destCol = (e.over.id as string).replace("col-", "") as Column;
    if (sourceCol === destCol) return;
    if (!ALLOWED[sourceCol].has(destCol)) {
      setError(`Can't move from ${sourceCol} to ${destCol}.`);
      return;
    }
    if (isPending) {
      setError("Hold on — previous move still in flight.");
      return;
    }

    const taskId = e.active.id as string;
    setPendingTaskId(taskId);
    setError(null);
    startTransition(async () => {
      try {
        if (destCol === "approved") await approveTask(taskId);
        else if (destCol === "denied")
          await rejectTask(taskId, "(rejected via drag)");
        else if (destCol === "edits")
          await requestEditsTask(taskId, "(needs edits — see comments)");
        else if (destCol === "pending") await unblockTask(taskId);
        else if (destCol === "completed")
          // Manual override: operator marks a task complete bypassing the
          // executor. We still go through approveTask (status=done) and add
          // a "Completed: …" executor-style comment so the column mapping
          // picks it up.
          await markCompletedTask(taskId, "(marked complete manually)");
        else if (destCol === "officeReview")
          await flagOfficeReviewTask(taskId, "(flagged for office review)");
        // Full reload — eliminates any chance of stale RSC cache showing
        // the card in its old column after a successful move.
        window.location.reload();
      } catch (err) {
        setError((err as Error).message || "Move failed.");
        setPendingTaskId(null);
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Status banner — sticks to the top so feedback is always visible */}
      {(isPending || error) && (
        <div
          role="status"
          className={`sticky top-0 z-30 mb-4 rounded-lg px-4 py-2 text-sm ${
            error
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-indigo-50 text-indigo-800 border border-indigo-200"
          }`}
        >
          {error
            ? error
            : `Moving ${pendingTaskId ?? ""}… holding other drops until this one lands.`}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {COLUMN_ORDER.map((col) => (
          <DroppableColumn
            key={col}
            col={col}
            tasks={buckets[col]}
            busy={isPending}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xl rotate-2 cursor-grabbing">
            <TaskCardBody task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
