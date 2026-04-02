"use client";

import type { Message } from "@/lib/types";
import MessageCard from "@/components/MessageCard";

type Props = {
  messages: Message[];
  onOpen: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
};

export default function PinnedView({ messages, onOpen, onArchive, onPin }: Props) {
  const pinned = messages.filter((m) => m.pinned && !m.archived);

  if (pinned.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            Aucun message épinglé
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-subtle)" }}>
            Swipez un message vers la droite pour l'épingler ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
          Épinglés
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
        >
          {pinned.length}
        </span>
      </div>
      <div className="space-y-2">
        {pinned.map((msg) => (
          <MessageCard
            key={msg.id}
            message={msg}
            onClick={onOpen}
            onArchive={onArchive}
            onPin={onPin}
          />
        ))}
      </div>
    </div>
  );
}
