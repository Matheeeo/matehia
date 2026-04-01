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
        body: JSON.stringify({ id: msg.id }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      );
    }
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Header */}
      <header className="px-4 pt-10 pb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          {unread > 0 && (
            <span className="text-sm text-zinc-400">
              {unread} non lu{unread > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Source filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSource(s)}
              className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition-colors ${
                activeSource === s
                  ? "bg-white text-black font-medium"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* Message list */}
      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
            Chargement…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
            Aucun message
          </div>
        ) : (
          messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} onClick={handleOpen} />
          ))
        )}
      </main>

      {/* Message detail modal */}
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
            <p className="text-sm text-zinc-400 leading-relaxed">
              {selected.content}
            </p>
            <p className="text-xs text-zinc-600">
              {new Date(selected.date).toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
