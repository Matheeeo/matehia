"use client";

import { type Message } from "@/lib/notion";

const SOURCE_COLORS: Record<string, string> = {
  WhatsApp: "bg-green-500/20 text-green-400 border-green-500/30",
  LinkedIn: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Email: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SMS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Autre: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const PRIORITY_DOT: Record<string, string> = {
  haute: "bg-red-500",
  normale: "bg-zinc-500",
  basse: "bg-zinc-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

type Props = {
  message: Message;
  onClick: (msg: Message) => void;
};

export default function MessageCard({ message, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(message)}
      className={`w-full text-left rounded-xl p-4 transition-colors ${
        message.read
          ? "bg-zinc-900 hover:bg-zinc-800/80"
          : "bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <span
          className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${PRIORITY_DOT[message.priority]}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SOURCE_COLORS[message.source] ?? SOURCE_COLORS.Autre}`}
            >
              {message.source}
            </span>
            <span className="text-xs text-zinc-500 shrink-0">
              {timeAgo(message.date)}
            </span>
          </div>

          <p className={`text-sm font-medium ${message.read ? "text-zinc-400" : "text-white"}`}>
            {message.sender}
          </p>
          <p className="text-sm text-zinc-500 truncate mt-0.5">{message.content}</p>
        </div>
      </div>
    </button>
  );
}
