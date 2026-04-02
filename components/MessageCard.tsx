"use client";

import { useRef, useState } from "react";
import type { Message, Priority } from "@/lib/types";

const SOURCE_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  WhatsApp: {
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.2)",
    label: "WhatsApp",
  },
  LinkedIn: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
    label: "LinkedIn",
  },
  Email: {
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.2)",
    label: "Email",
  },
  SMS: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
    label: "SMS",
  },
};

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "#f87171",
  important: "#fb923c",
  normal: "transparent",
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

const SWIPE_THRESHOLD = 68;

type Props = {
  message: Message;
  onClick: (msg: Message) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
};

export default function MessageCard({
  message,
  onClick,
  onArchive,
  onPin,
}: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizSwipe = useRef<boolean | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizSwipe.current = null;
    setSwiping(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (isHorizSwipe.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        isHorizSwipe.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }
    if (!isHorizSwipe.current) return;

    e.preventDefault();
    setOffsetX(Math.max(-130, Math.min(130, dx)));
  }

  function handleTouchEnd() {
    setSwiping(false);
    if (offsetX > SWIPE_THRESHOLD) {
      onPin(message.id);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onArchive(message.id);
    }
    setOffsetX(0);
    isHorizSwipe.current = null;
  }

  const isPinSwipe = offsetX > SWIPE_THRESHOLD;
  const isArchiveSwipe = offsetX < -SWIPE_THRESHOLD;
  const src = SOURCE_CONFIG[message.source] ?? SOURCE_CONFIG.Email;
  const dotColor = PRIORITY_DOT[message.priority];

  return (
    <div className="relative overflow-hidden rounded-2xl select-none">
      {/* Pin background (right swipe) */}
      <div
        className="absolute inset-0 flex items-center justify-start pl-5 transition-opacity duration-150"
        style={{
          background: "var(--accent-dim)",
          opacity: offsetX > 10 ? Math.min(1, offsetX / SWIPE_THRESHOLD) : 0,
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
          </svg>
          <span
            className="text-sm font-medium"
            style={{ color: isPinSwipe ? "var(--accent)" : "rgba(139,92,246,0.6)" }}
          >
            {message.pinned ? "Désépingler" : "Épingler"}
          </span>
        </div>
      </div>

      {/* Archive background (left swipe) */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-5 transition-opacity duration-150"
        style={{
          background: "rgba(255,255,255,0.04)",
          opacity: offsetX < -10 ? Math.min(1, -offsetX / SWIPE_THRESHOLD) : 0,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{
              color: isArchiveSwipe ? "var(--text-muted)" : "var(--text-subtle)",
            }}
          >
            Archiver
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isArchiveSwipe ? "var(--text-muted)" : "var(--text-subtle)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </div>
      </div>

      {/* Card */}
      <button
        className="swipe-card relative w-full text-left rounded-2xl px-4 py-3.5"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? "none" : "transform 0.22s cubic-bezier(0.32,0.72,0,1)",
          background: message.pinned
            ? "linear-gradient(135deg, var(--surface) 0%, rgba(139,92,246,0.06) 100%)"
            : "var(--surface)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: message.pinned
            ? "var(--accent-border)"
            : message.priority === "urgent" && !message.read
            ? "rgba(248,113,113,0.2)"
            : "var(--border)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onClick(message)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}
          >
            {message.initials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: message.read ? "var(--text-muted)" : "var(--text)" }}
                >
                  {message.sender}
                </span>
                {message.pinned && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="var(--accent)"
                    stroke="none"
                  >
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {dotColor !== "transparent" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: dotColor }}
                  />
                )}
                <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  {timeAgo(message.date)}
                </span>
              </div>
            </div>

            {/* Source badge + preview */}
            <div className="flex items-center gap-2">
              <span
                className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{
                  background: src.bg,
                  color: src.color,
                  border: `1px solid ${src.border}`,
                }}
              >
                {src.label}
              </span>
              <p
                className="text-sm truncate"
                style={{ color: message.read ? "var(--text-subtle)" : "rgba(255,255,255,0.6)" }}
              >
                {message.preview}
              </p>
            </div>
          </div>

          {/* Unread dot */}
          {!message.read && (
            <span
              className="shrink-0 w-2 h-2 rounded-full mt-2"
              style={{ background: "var(--accent)" }}
            />
          )}
        </div>
      </button>
    </div>
  );
}
