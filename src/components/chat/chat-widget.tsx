"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatIcon } from "./chat-icon";
import { ChatWindow } from "./chat-window";
import type { ChatMessage } from "./types";
import { useSessions } from "./use-sessions";

const STORAGE_KEY = "hermes-chat-position-v1";
const DRAG_THRESHOLD = 5;

export interface ChatWidgetProps {
  /** API route on YOUR app that proxies to Hermes. Default: "/api/chat". */
  endpoint?: string;
  /** Icon diameter in px. Default: 56. */
  iconSize?: number;
  /** Header bar colour. Default: indigo-950. */
  headerColor?: string;
  /** Display name in the header. Default: "Assistant". */
  title?: string;
}

interface Position {
  top: number;
  left: number;
}

function clampToViewport(pos: Position, iconSize: number): Position {
  if (typeof window === "undefined") return pos;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    top: Math.max(8, Math.min(h - iconSize - 8, pos.top)),
    left: Math.max(8, Math.min(w - iconSize - 8, pos.left)),
  };
}

function getDefaultPosition(iconSize: number): Position {
  if (typeof window === "undefined") return { top: 100, left: 100 };
  return {
    top: window.innerHeight - iconSize - 32,
    left: window.innerWidth - iconSize - 32,
  };
}

function loadStoredPosition(): Position | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.top === "number" && typeof parsed.left === "number") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Floating draggable chat widget. Mount once at the root of your app.
 *
 * Position is persisted in localStorage. Drag the icon to reposition;
 * click it (no drag) to open the chat window. The window anchors to the
 * icon and flips to stay on-screen.
 */
export function ChatWidget({
  endpoint = "/api/chat",
  iconSize = 56,
  headerColor,
  title = "Assistant",
}: ChatWidgetProps = {}) {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const {
    activeId,
    sessions,
    messages,
    setMessages,
    newSession,
    loadSession,
    deleteSession,
  } = useSessions();

  const dragState = useRef<{
    startX: number;
    startY: number;
    originTop: number;
    originLeft: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    setPosition(clampToViewport(loadStoredPosition() ?? getDefaultPosition(iconSize), iconSize));
    setMounted(true);
  }, [iconSize]);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      /* ignore */
    }
  }, [position, mounted]);

  useEffect(() => {
    const onResize = () => setPosition((p) => clampToViewport(p, iconSize));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [iconSize]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originTop: position.top,
        originLeft: position.left,
        moved: false,
      };
    },
    [position.top, position.left]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current;
      if (!state) return;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (!state.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        state.moved = true;
      }
      if (state.moved) {
        setPosition(
          clampToViewport(
            { top: state.originTop + dy, left: state.originLeft + dx },
            iconSize
          )
        );
      }
    },
    [iconSize]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state) return;
    const wasClick = !state.moved;
    dragState.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
    if (wasClick) {
      setIsOpen((v) => !v);
    }
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", content: text };
      let snapshot: ChatMessage[] = [];
      setMessages((prev) => {
        snapshot = [...prev, userMsg];
        return snapshot;
      });
      setIsLoading(true);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: snapshot.map(({ role, content }) => ({ role, content })),
            // Pathname lets the proxy inject "operator is currently looking at X"
            // into Hermes's system prompt — so "run an audit" knows the client.
            context: { pathname },
          }),
        });
        const data = await res.json().catch(() => ({}));
        const assistantMsg: ChatMessage = res.ok
          ? { role: "assistant", content: data.reply ?? "(no response)" }
          : {
              role: "assistant",
              content: data.error
                ? `${data.error}${data.details ? `\n\n${data.details}` : ""}`
                : "The assistant hit an unexpected error.",
            };
        setMessages([...snapshot, assistantMsg]);
      } catch (err) {
        setMessages([
          ...snapshot,
          {
            role: "assistant",
            content: `Network error: ${err instanceof Error ? err.message : String(err)}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, pathname, setMessages]
  );

  if (!mounted) return null;

  const iconState = isLoading ? "thinking" : isOpen ? "active" : "idle";

  return (
    <>
      <div
        className="fixed z-[9999] cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ top: position.top, left: position.left, width: iconSize, height: iconSize }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="button"
        aria-label={isOpen ? `Close ${title}` : `Open ${title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
      >
        <ChatIcon size={iconSize} state={iconState} />
      </div>

      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onClose={() => setIsOpen(false)}
          anchor={position}
          iconSize={iconSize}
          sessions={sessions}
          activeId={activeId}
          onLoadSession={loadSession}
          onDeleteSession={deleteSession}
          onNewChat={newSession}
          headerColor={headerColor}
          title={title}
        />
      )}
    </>
  );
}
