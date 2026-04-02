"use client";

import { useState, useCallback } from "react";
import type { Message, Priority } from "@/lib/types";
import { MOCK_MESSAGES } from "@/lib/mockData";
import BottomNav, { type Tab } from "@/components/BottomNav";
import MessageDetail from "@/components/MessageDetail";
import AllView from "@/components/views/AllView";
import ChannelsView from "@/components/views/ChannelsView";
import PriorityView from "@/components/views/PriorityView";
import PinnedView from "@/components/views/PinnedView";

export default function LuxeePage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Message | null>(null);

  const handleOpen = useCallback((msg: Message) => {
    setSelected(msg);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
    );
  }, []);

  const handleArchive = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, archived: true, pinned: false } : m))
    );
    setSelected((s) => (s?.id === id ? null : s));
  }, []);

  const handlePin = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    );
    setSelected((s) =>
      s?.id === id ? { ...s, pinned: !s.pinned } : s
    );
  }, []);

  const handleSetPriority = useCallback((id: string, priority: Priority) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, priority } : m))
    );
    setSelected((s) => (s?.id === id ? { ...s, priority } : s));
  }, []);

  const handleReply = useCallback((id: string, text: string) => {
    const newMsg = {
      id: `${id}-reply-${Date.now()}`,
      content: text,
      date: new Date().toISOString(),
      fromMe: true,
    };
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              thread: [...m.thread, newMsg],
              preview: text,
              date: new Date().toISOString(),
              read: true,
            }
          : m
      )
    );
    setSelected((s) =>
      s?.id === id
        ? {
            ...s,
            thread: [...s.thread, newMsg],
            preview: text,
            date: new Date().toISOString(),
          }
        : s
    );
  }, []);

  const active = messages.filter((m) => !m.archived);
  const unreadCount = active.filter((m) => !m.read).length;
  const pinnedCount = active.filter((m) => m.pinned).length;

  const VIEW_TITLES: Record<Tab, string> = {
    all: "Tout",
    channels: "Canaux",
    priority: "Priorité",
    pinned: "Épinglés",
  };

  return (
    <div
      className="flex flex-col h-full max-w-lg mx-auto"
      style={{ background: "var(--bg)" }}
    >
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between px-5"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 52px)",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col">
          <span className="luxee-wordmark text-2xl">luxee</span>
          <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {VIEW_TITLES[tab]}
            {tab === "all" && unreadCount > 0 && (
              <> · <span style={{ color: "var(--accent)" }}>{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span></>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell — decorative in V1 */}
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full pulse"
                style={{ background: "#f87171" }}
              />
            )}
          </button>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
          >
            D
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {tab === "all" && (
          <AllView
            messages={messages}
            onOpen={handleOpen}
            onArchive={handleArchive}
            onPin={handlePin}
          />
        )}
        {tab === "channels" && (
          <ChannelsView
            messages={messages}
            onOpen={handleOpen}
            onArchive={handleArchive}
            onPin={handlePin}
          />
        )}
        {tab === "priority" && (
          <PriorityView
            messages={messages}
            onOpen={handleOpen}
            onArchive={handleArchive}
            onPin={handlePin}
          />
        )}
        {tab === "pinned" && (
          <PinnedView
            messages={messages}
            onOpen={handleOpen}
            onArchive={handleArchive}
            onPin={handlePin}
          />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav
        active={tab}
        onChange={setTab}
        counts={{ all: unreadCount, pinned: pinnedCount }}
      />

      {/* Message detail sheet */}
      {selected && (
        <MessageDetail
          message={selected}
          onClose={() => setSelected(null)}
          onArchive={handleArchive}
          onPin={handlePin}
          onSetPriority={handleSetPriority}
          onReply={handleReply}
        />
      )}
    </div>
  );
}
