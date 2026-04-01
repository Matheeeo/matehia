"use client";

import { useEffect, useState, useCallback } from "react";
import MessageCard from "@/components/MessageCard";
import { type Message, type Source } from "@/lib/notion";

const SOURCES: (Source | "Tous")[] = [
  "Tous",
  "WhatsApp",
  "LinkedIn",
  "Email",
  "SMS",
  "Autre",
];

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSource, setActiveSource] = useState<Source | "Tous">("Tous");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = useCallback(async (source: Source | "Tous") => {
    setLoading(true);
    const url =
      source === "Tous"
        ? "/api/messages"
        : `/api/messages?source=${encodeURIComponent(source)}`;
    const res = await fetch(url);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages(activeSource);
  }, [activeSource, fetchMessages]);

  async function handleOpen(msg: Message) {
    setSelected(msg);
    if (!msg.read) {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, action: "read" }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      );
    }
  }

  async function handleArchive(id: string) {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "archive" }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleUrgent(id: string) {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "urgent" }),
    });
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, priority: "haute", read: false } : m
      )
    );
  }

  // Split messages into sections
  const urgent = messages.filter((m) => !m.read && m.priority === "haute");
  const toHandle = messages.filter(
    (m) => !m.read && m.priority !== "haute"
  );
  const done = messages.filter((m) => m.read);

  // Count per source for filter badges
  const countBySource = messages.reduce<Record<string, number>>((acc, m) => {
    acc[m.source] = (acc[m.source] ?? 0) + (!m.read ? 1 : 0);
    return acc;
  }, {});
  const totalUnread = messages.filter((m) => !m.read).length;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Header */}
      <header className="px-4 pt-10 pb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          {totalUnread > 0 && (
            <span className="text-sm text-zinc-400">
              {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Source filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {SOURCES.map((s) => {
            const count =
              s === "Tous" ? totalUnread : countBySource[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => setActiveSource(s)}
                className={`shrink-0 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors ${
                  activeSource === s
                    ? "bg-white text-black font-medium"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {s}
                {count > 0 && (
                  <span
                    className={`text-xs rounded-full w-4 h-4 flex items-center justify-center ${
                      activeSource === s
                        ? "bg-black/20 text-black"
                        : "bg-zinc-600 text-zinc-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Message list */}
      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
            Chargement…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
            Aucun message
          </div>
        ) : (
          <>
            {/* Urgent */}
            {urgent.length > 0 && (
              <section>
                <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
                  Urgent
                </p>
                <div className="space-y-2">
                  {urgent.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onClick={handleOpen}
                      onArchive={handleArchive}
                      onUrgent={handleUrgent}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* À traiter */}
            {toHandle.length > 0 && (
              <section>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  À traiter
                </p>
                <div className="space-y-2">
                  {toHandle.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onClick={handleOpen}
                      onArchive={handleArchive}
                      onUrgent={handleUrgent}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Lu */}
            {done.length > 0 && (
              <section>
                <p className="text-xs font-medium text-zinc-700 uppercase tracking-wider mb-2">
                  Lu
                </p>
                <div className="space-y-2">
                  {done.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onClick={handleOpen}
                      onArchive={handleArchive}
                      onUrgent={handleUrgent}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Message detail — bottom sheet */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-zinc-900 rounded-t-2xl p-6 pb-10 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {selected.source}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="font-semibold text-lg">{selected.sender}</p>

            {selected.summary && (
              <p className="text-sm text-white/80 bg-zinc-800 rounded-lg px-3 py-2 leading-relaxed">
                {selected.summary}
              </p>
            )}

            <p className="text-sm text-zinc-400 leading-relaxed">
              {selected.content}
            </p>

            <p className="text-xs text-zinc-600">
              {new Date(selected.date).toLocaleString("fr-FR")}
            </p>

            {/* Quick actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  handleUrgent(selected.id);
                  setSelected(null);
                }}
                className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium"
              >
                Urgent
              </button>
              <button
                onClick={() => {
                  handleArchive(selected.id);
                  setSelected(null);
                }}
                className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-medium"
              >
                Archiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
