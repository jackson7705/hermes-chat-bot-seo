"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChatSession } from "./use-sessions";

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({
  sessions,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: ChatHistoryProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <EmptyHistory onNewChat={onNewChat} />
        ) : (
          <ul className="space-y-px p-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "group flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    activeId === s.id
                      ? "bg-indigo-50 text-slate-900"
                      : "hover:bg-slate-50"
                  )}
                >
                  <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-800">
                      {s.title || "New chat"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {formatRelative(s.updatedAt)}
                      {" · "}
                      {s.messages.length} message{s.messages.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(s.id);
                      }
                    }}
                    className="invisible shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 focus-visible:visible group-hover:visible"
                  >
                    <Trash2 className="size-3.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-slate-200 p-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>
    </div>
  );
}

function EmptyHistory({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
      <MessageSquare className="size-8 text-slate-300" />
      <p className="mt-3 text-sm font-medium text-slate-700">No chats yet</p>
      <p className="mt-1 text-xs text-slate-500">
        Your conversation history will appear here.
      </p>
      <button
        type="button"
        onClick={onNewChat}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
      >
        <Plus className="size-3.5" />
        Start a new chat
      </button>
    </div>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(ts).toLocaleDateString();
}
