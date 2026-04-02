"use client";

import { useState } from "react";
import type { Message, Source } from "@/lib/types";
import MessageCard from "@/components/MessageCard";

const CHANNELS: { id: Source; label: string; color: string; bg: string; border: string }[] = [
  { id: "WhatsApp", label: "WhatsApp", color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
  { id: "LinkedIn", label: "LinkedIn", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)" },
  { id: "Email", label: "Email", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
  { id: "SMS", label: "SMS", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
];

type Props = {
  messages: Message[];
  onOpen: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
};

export default function ChannelsView({ messages, onOpen, onArchive, onPin }: Props) {
  const [activeChannel, setActiveChannel] = useState<Source | "Tous">("Tous");

  const active = messages.filter((m) => !m.archived);
  const filtered =
    activeChannel === "Tous"
      ? active
      : active.filter((m) => m.source === activeChannel);

  const countBySource = active.reduce<Record<string, number>>((acc, m) => {
    if (!m.read) acc[m.source] = (acc[m.source] ?? 0) + 1;
    return acc;
  }, {});

  const totalUnread = active.filter((m) => !m.read).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Channel tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveChannel("Tous")}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
          style={
            activeChannel === "Tous"
              ? { background: "var(--accent)", color: "#fff" }
              : { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }
          }
        >
          Tous
          {totalUnread > 0 && (
            <span
              className="text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold"
              style={
                activeChannel === "Tous"
                  ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                  : { background: "var(--accent)", color: "#fff" }
              }
            >
              {totalUnread}
            </span>
          )}
        </button>

        {CHANNELS.map((ch) => {
          const count = countBySource[ch.id] ?? 0;
          const isActive = activeChannel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={
                isActive
                  ? { background: ch.bg, color: ch.color, border: `1px solid ${ch.border}` }
                  : { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }
            >
              {ch.label}
              {count > 0 && (
                <span
                  className="text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold"
                  style={{ background: ch.color + "33", color: ch.color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
            Aucun message sur ce canal
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              onClick={onOpen}
              onArchive={onArchive}
              onPin={onPin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
