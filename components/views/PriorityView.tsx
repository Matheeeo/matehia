"use client";

import type { Message } from "@/lib/types";
import MessageCard from "@/components/MessageCard";

type Props = {
  messages: Message[];
  onOpen: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
};

export default function PriorityView({ messages, onOpen, onArchive, onPin }: Props) {
  const active = messages.filter((m) => !m.archived);
  const urgent = active.filter((m) => m.priority === "urgent");
  const important = active.filter((m) => m.priority === "important");
  const normal = active.filter((m) => m.priority === "normal");

  return (
    <div className="space-y-6">
      {/* AI info banner */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
      >
        <span
          className="pulse w-2 h-2 rounded-full shrink-0"
          style={{ background: "var(--accent)" }}
        />
        <p className="text-xs leading-relaxed" style={{ color: "var(--accent)" }}>
          Priorité analysée par <strong>Claude IA</strong> — vous pouvez la modifier manuellement dans chaque message.
        </p>
      </div>

      <PrioritySection
        label="Urgent"
        count={urgent.length}
        dotColor="#f87171"
        barColor="rgba(248,113,113,0.25)"
        messages={urgent}
        onOpen={onOpen}
        onArchive={onArchive}
        onPin={onPin}
        emptyText="Aucun message urgent"
      />

      <PrioritySection
        label="Important"
        count={important.length}
        dotColor="#fb923c"
        barColor="rgba(251,146,60,0.2)"
        messages={important}
        onOpen={onOpen}
        onArchive={onArchive}
        onPin={onPin}
        emptyText="Aucun message important"
      />

      <PrioritySection
        label="Normal"
        count={normal.length}
        dotColor="var(--text-subtle)"
        barColor="var(--surface-2)"
        messages={normal}
        onOpen={onOpen}
        onArchive={onArchive}
        onPin={onPin}
        emptyText="Aucun message normal"
      />
    </div>
  );
}

function PrioritySection({
  label,
  count,
  dotColor,
  barColor,
  messages,
  onOpen,
  onArchive,
  onPin,
  emptyText,
}: {
  label: string;
  count: number;
  dotColor: string;
  barColor: string;
  messages: Message[];
  onOpen: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
  emptyText: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
        <h3 className="text-sm font-semibold" style={{ color: dotColor }}>
          {label}
        </h3>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
          style={{ background: barColor, color: dotColor }}
        >
          {count}
        </span>
      </div>
      {messages.length === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: "var(--text-subtle)" }}>
          {emptyText}
        </p>
      ) : (
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
      )}
    </section>
  );
}
