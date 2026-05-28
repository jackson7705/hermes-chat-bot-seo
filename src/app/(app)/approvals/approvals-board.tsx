"use client";

import { useRef, useState, useTransition } from "react";
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
  type Column,
  type KanbanTask,
} from "@/lib/columns";
import {
  approveTask,
  rejectTask,
  requestEditsTask,
  unblockTask,
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
  approved: "border-emerald-300 text-emerald-700",
  denied: "border-rose-300 text-rose-700",
  edits: "border-amber-300 text-amber-700",
};

const COLUMN_DROP_HINT: Record<Column, string> = {
  pending: "ring-2 ring-slate-400/60",
  approved: "ring-2 ring-emerald-500/60",
  denied: "ring-2 ring-rose-500/60",
  edits: "ring-2 ring-amber-500/60",
};

const ALLOWED: Record<Column, Set<Column>> = {
  pending: new Set<Column>(["approved", "denied", "edits"]),
  edits: new Set<Column>(["pending"]),
  approved: new Set<Column>(),
  denied: new Set<Column>(),
};

function TaskCardBody({ task }: { task: KanbanTask }) {
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
    </>
  );
}

function DraggableCard({
  task,
  sourceCol,
}: {
  task: KanbanTask;
  sourceCol: Column;
}) {
  const router = useRouter();
  const draggable = ALLOWED[sourceCol].size > 0;
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
}: {
  col: Column;
  tasks: KanbanTask[];
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
              <DraggableCard task={task} sourceCol={col} />
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
  const [, startTransition] = useTransition();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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
    if (!ALLOWED[sourceCol].has(destCol)) return;

    const taskId = e.active.id as string;
    startTransition(async () => {
      try {
        if (destCol === "approved") await approveTask(taskId);
        else if (destCol === "denied")
          await rejectTask(taskId, "(rejected via drag)");
        else if (destCol === "edits")
          await requestEditsTask(taskId, "(needs edits — see comments)");
        else if (destCol === "pending") await unblockTask(taskId);
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMN_ORDER.map((col) => (
          <DroppableColumn key={col} col={col} tasks={buckets[col]} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xl rotate-2 cursor-grabbing">
            <TaskCardBody task={activeTask} />
          </div>
        )}
      </DragOverlay>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </DndContext>
  );
}
