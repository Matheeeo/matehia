"use client";

import { useRef, useState } from "react";
import { type Message } from "@/lib/notion";

const SOURCE_COLORS: Record<string, string> = {
  WhatsApp: "bg-green-500/20 text-green-400 border-green-500/30",
  LinkedIn: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Email: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SMS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Autre: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
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

const SWIPE_THRESHOLD = 72;

type Props = {
  message: Message;
  onClick: (msg: Message) => void;
  onArchive: (id: string) => void;
  onUrgent: (id: string) => void;
};

export default function MessageCard({
  message,
  onClick,
  onArchive,
  onUrgent,
}: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    setOffsetX(Math.max(-120, Math.min(120, dx)));
  }

  function handleTouchEnd() {
    setSwiping(false);
    if (offsetX > SWIPE_THRESHOLD) {
      onUrgent(message.id);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onArchive(message.id);
    }
    setOffsetX(0);
  }

  const isUrgentSwipe = offsetX > SWIPE_THRESHOLD;
  const isArchiveSwipe = offsetX < -SWIPE_THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        <div
          className={`flex items-center justify-start pl-4 w-full transition-opacity ${
            isUrgentSwipe ? "opacity-100" : "opacity-40"
          } bg-red-500/20`}
        >
          <span className="text-red-400 text-sm font-medium">Urgent</span>
        </div>
      </div>
      <div className="absolute inset-0 flex justify-end">
        <div
          className={`flex items-center justify-end pr-4 w-full transition-opacity ${
            isArchiveSwipe ? "opacity-100" : "opacity-40"
          } bg-zinc-700/40`}
        >
          <span className="text-zinc-400 text-sm font-medium">Archiver</span>
        </div>
      </div>

      {/* Card */}
      <button
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? "none" : "transform 0.2s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onClick(message)}
        className={`relative w-full text-left rounded-xl p-4 transition-colors ${
          message.priority === "haute"
            ? "bg-zinc-800 border border-red-500/30"
            : message.read
            ? "bg-zinc-900 hover:bg-zinc-800/80"
            : "bg-zinc-800 border border-zinc-700"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  SOURCE_COLORS[message.source] ?? SOURCE_COLORS.Autre
                }`}
              >
                {message.source}
              </span>
              <span className="text-xs text-zinc-500 shrink-0">
                {timeAgo(message.date)}
              </span>
            </div>

            <p
              className={`text-sm font-medium ${
                message.read ? "text-zinc-400" : "text-white"
              }`}
            >
              {message.sender}
              {message.priority === "haute" && (
                <span className="ml-2 text-xs text-red-400 font-normal">
                  urgent
                </span>
              )}
            </p>

            <p className="text-sm text-zinc-500 truncate mt-0.5">
              {message.summary || message.content}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
