"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "./types";

const STORAGE_KEY = "hermes-chat-sessions-v1";
const MAX_SESSIONS = 30;

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

interface SessionsStore {
  activeId: string | null;
  sessions: Record<string, ChatSession>;
}

function emptyStore(): SessionsStore {
  return { activeId: null, sessions: {} };
}

function loadStore(): SessionsStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.sessions) {
      return parsed as SessionsStore;
    }
  } catch {
    // corrupt — fall through to empty
  }
  return emptyStore();
}

function persistStore(store: SessionsStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded — silently drop
  }
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  return first.content.slice(0, 80).trim() || "New chat";
}

function normalize(store: SessionsStore): SessionsStore {
  const kept = Object.values(store.sessions)
    .filter((s) => s.messages.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SESSIONS);
  const sessions: Record<string, ChatSession> = {};
  for (const s of kept) sessions[s.id] = s;
  const activeId = store.activeId && sessions[store.activeId] ? store.activeId : null;
  return { activeId, sessions };
}

export interface UseSessionsApi {
  activeId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  setMessages: (next: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  newSession: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
  hydrated: boolean;
}

export function useSessions(): UseSessionsApi {
  const [store, setStore] = useState<SessionsStore>(emptyStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(normalize(loadStore()));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistStore(store);
  }, [store, hydrated]);

  const sessions = useMemo(
    () => Object.values(store.sessions).sort((a, b) => b.updatedAt - a.updatedAt),
    [store.sessions]
  );

  const activeSession = store.activeId ? store.sessions[store.activeId] : null;
  const messages = activeSession?.messages ?? [];

  const setMessages = useCallback<UseSessionsApi["setMessages"]>((next) => {
    setStore((prev) => {
      const currentActive = prev.activeId ? prev.sessions[prev.activeId] : null;
      const prevMessages = currentActive?.messages ?? [];
      const resolved = typeof next === "function" ? next(prevMessages) : next;

      if (!currentActive) {
        if (resolved.length === 0) return prev;
        const id = genId();
        const now = Date.now();
        const session: ChatSession = {
          id,
          title: deriveTitle(resolved),
          createdAt: now,
          updatedAt: now,
          messages: resolved,
        };
        return normalize({
          activeId: id,
          sessions: { ...prev.sessions, [id]: session },
        });
      }

      const updated: ChatSession = {
        ...currentActive,
        messages: resolved,
        title: deriveTitle(resolved) || currentActive.title,
        updatedAt: Date.now(),
      };
      return normalize({
        activeId: currentActive.id,
        sessions: { ...prev.sessions, [currentActive.id]: updated },
      });
    });
  }, []);

  const newSession = useCallback(() => {
    setStore((prev) => {
      const current = prev.activeId ? prev.sessions[prev.activeId] : null;
      if (current && current.messages.length === 0) {
        return { ...prev, activeId: current.id };
      }
      return { activeId: null, sessions: prev.sessions };
    });
  }, []);

  const loadSession = useCallback((id: string) => {
    setStore((prev) => {
      if (!prev.sessions[id]) return prev;
      return { ...prev, activeId: id };
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setStore((prev) => {
      const { [id]: _removed, ...rest } = prev.sessions;
      const nextActive = prev.activeId === id ? null : prev.activeId;
      return { activeId: nextActive, sessions: rest };
    });
  }, []);

  return {
    activeId: store.activeId,
    sessions,
    messages,
    setMessages,
    newSession,
    loadSession,
    deleteSession,
    hydrated,
  };
}
