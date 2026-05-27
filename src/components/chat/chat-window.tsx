"use client";

import { useEffect, useRef, useState } from "react";
import { History, Plus, Send, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ChatHistory } from "./chat-history";
import type { ChatMessage } from "./types";
import type { ChatSession } from "./use-sessions";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  /** Pixel offset (top-left of the icon). The window flips to stay on-screen. */
  anchor: { top: number; left: number };
  iconSize: number;
  sessions: ChatSession[];
  activeId: string | null;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  /** Optional brand colour for the header. Default: indigo-950. */
  headerColor?: string;
  /** Optional name shown in the header. Default: "Assistant". */
  title?: string;
}

const CHAT_WIDTH = 360;
const CHAT_HEIGHT = 480;
const GAP = 12;

type View = "chat" | "history";

export function ChatWindow({
  messages,
  isLoading,
  onSend,
  onClose,
  anchor,
  iconSize,
  sessions,
  activeId,
  onLoadSession,
  onDeleteSession,
  onNewChat,
  headerColor = "#1e1b4b",
  title = "Assistant",
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<View>("chat");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (view === "chat" && scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, isLoading, view]);

  useEffect(() => {
    if (view === "chat") textareaRef.current?.focus();
  }, [view]);

  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

  let top = anchor.top + iconSize + GAP;
  let left = anchor.left;
  if (top + CHAT_HEIGHT > viewportH - 16) {
    top = Math.max(16, anchor.top - CHAT_HEIGHT - GAP);
  }
  if (left + CHAT_WIDTH > viewportW - 16) {
    left = Math.max(16, viewportW - CHAT_WIDTH - 16);
  }
  if (left < 16) left = 16;

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text || isLoading) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div
      className="fixed z-[9999] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
      style={{ top, left, width: CHAT_WIDTH, height: CHAT_HEIGHT }}
      role="dialog"
      aria-label={title}
    >
      <div
        className="flex items-center justify-between rounded-t-2xl px-3 py-3"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex min-w-0 items-center gap-2 text-white">
          <span className="text-sm font-semibold tracking-tight">
            {view === "history" ? "Recent chats" : title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {view === "chat" ? (
            <>
              <HeaderIconButton
                label="New chat"
                onClick={() => {
                  onNewChat();
                  setDraft("");
                }}
              >
                <Plus className="size-4" />
              </HeaderIconButton>
              <HeaderIconButton label="Recent chats" onClick={() => setView("history")}>
                <History className="size-4" />
              </HeaderIconButton>
            </>
          ) : (
            <HeaderIconButton label="Back to chat" onClick={() => setView("chat")}>
              <span className="px-1 text-xs font-medium">Back</span>
            </HeaderIconButton>
          )}
          <HeaderIconButton label="Close" onClick={onClose}>
            <X className="size-4" />
          </HeaderIconButton>
        </div>
      </div>

      {view === "history" ? (
        <ChatHistory
          sessions={sessions}
          activeId={activeId}
          onSelect={(id) => {
            onLoadSession(id);
            setView("chat");
          }}
          onDelete={onDeleteSession}
          onNewChat={() => {
            onNewChat();
            setDraft("");
            setView("chat");
          }}
        />
      ) : (
        <>
          <div
            ref={scrollerRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 && !isLoading && <WelcomeMessage title={title} />}
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {isLoading && <ThinkingBubble />}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type a message…"
                rows={1}
                className="max-h-32 min-h-9 flex-1 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !draft.trim()}
                aria-label="Send"
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white transition-colors",
                  draft.trim() && !isLoading
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-slate-300"
                )}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function HeaderIconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 min-w-7 items-center justify-center rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function WelcomeMessage({ title }: { title: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      <p className="mb-2 font-medium text-slate-800">Hi, I&apos;m {title} 👋</p>
      <p>Ask me anything. Your conversation is saved locally and can be revisited from the History menu.</p>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
          isUser
            ? "rounded-br-sm bg-indigo-600 text-white"
            : "rounded-bl-sm bg-slate-100 text-slate-800"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2">
        <div className="flex gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
}
