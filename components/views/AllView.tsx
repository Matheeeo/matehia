"use client";

import type { Message, Priority } from "@/lib/types";
import MessageCard from "@/components/MessageCard";

type Props = {
  messages: Message[];
  onOpen: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
};

export default function AllView({ messages, onOpen, onArchive, onPin }: Props) {
  const active = messages.filter((m) => !m.archived);

  const urgent = active.filter((m) => !m.read && m.priority === "urgent");
  const important = active.filter((m) => !m.read && m.priority === "important");
  const normal = active.filter((m) => !m.read && m.priority === "normal");
  const read = active.filter((m) => m.read);

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Tout est traité</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {urgent.length > 0 && (
        <Section
          label="Urgent"
          labelColor="#f87171"
          messages={urgent}
          onOpen={onOpen}
          onArchive={onArchive}
          onPin={onPin}
        />
      )}
      {important.length > 0 && (
        <Section
          label="Important"
          labelColor="#fb923c"
          messages={important}
          onOpen={onOpen}
          onArchive={onArchive}
          onPin={onPin}
        />
      )}
      {normal.length > 0 && (
        <Section
          label="À traiter"
          labelColor="var(--text-muted)"
          messages={normal}
          onOpen={onOpen}
          onArchive={onArchive}
          onPin={onPin}
        />
      )}
      {read.length > 0 && (
        <Section
          label="Lu"
          labelColor="var(--text-subtle)"
          messages={read}
          onOpen={onOpen}
          onArchive={onArchive}
          onPin={onPin}
        />
      )}
    </div>
  );
}

function Section({
  label,
  labelColor,
  messages,
  onOpen,
  onArchive,
  onPin,
}: {
  label: string;
  labelColor: string;
  messages: Message[];
  onOpen: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
}) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-0.5" style={{ color: labelColor }}>
        {label}
      </p>
      <div className="space-y-2">
        {messages.map((msg) => (
          <MessageCard
            key={msg.id}
            message={msg}
            onClick={onOpen}
            onArchive={onArchive}
            onPin={onPin}
          />
        ))}
      </div>
    </section>
  );
}
