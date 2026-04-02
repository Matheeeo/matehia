"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, Priority } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  WhatsApp: "WhatsApp",
  LinkedIn: "LinkedIn",
  Email: "Email",
  SMS: "SMS",
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  important: { label: "Important", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  normal: { label: "Normal", color: "var(--text-muted)", bg: "var(--surface-2)" },
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return `Aujourd'hui ${formatTime(dateStr)}`;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  message: Message;
  onClose: () => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onReply: (id: string, text: string) => void;
};

export default function MessageDetail({
  message,
  onClose,
  onArchive,
  onPin,
  onSetPriority,
  onReply,
}: Props) {
  const [replyText, setReplyText] = useState("");
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [message.thread]);

  function handleSend() {
    const text = replyText.trim();
    if (!text) return;
    onReply(message.id, text);
    setReplyText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const p = PRIORITY_CONFIG[message.priority];

  return (
    <div className="fixed inset-0 z-50 flex flex-col fade-in" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="mt-auto w-full max-w-lg mx-auto flex flex-col sheet-enter"
        style={{
          background: "var(--surface)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "90vh",
          borderTop: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {SOURCE_LABELS[message.source] ?? message.source}
              </span>
              {/* AI badge */}
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
              >
                <span className="pulse w-1 h-1 rounded-full" style={{ background: "var(--accent)", display: "inline-block" }} />
                IA · {p.label}
              </span>
            </div>
            <p className="font-semibold text-base" style={{ color: "var(--text)" }}>
              {message.sender}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-3" style={{ minHeight: 0 }}>
          {message.thread.map((msg) => (
            <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[78%] px-4 py-2.5 rounded-2xl"
                style={
                  msg.fromMe
                    ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: "6px" }
                    : { background: "var(--surface-2)", color: "var(--text)", borderBottomLeftRadius: "6px", border: "1px solid var(--border)" }
                }
              >
                {!msg.fromMe && msg.senderName && (
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>
                    {msg.senderName}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p
                  className="text-[10px] mt-1 text-right"
                  style={{ color: msg.fromMe ? "rgba(255,255,255,0.6)" : "var(--text-subtle)" }}
                >
                  {formatTime(msg.date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions row */}
        <div className="flex gap-2 px-5 pb-3">
          {/* Priority selector */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background: p.bg, color: p.color, border: `1px solid ${p.color}33` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
              {p.label}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M5 7L1 3h8L5 7z" />
              </svg>
            </button>
            {showPriorityMenu && (
              <div
                className="absolute bottom-full mb-2 left-0 rounded-xl overflow-hidden shadow-xl z-10"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", minWidth: "130px" }}
              >
                {(["urgent", "important", "normal"] as Priority[]).map((pr) => {
                  const cfg = PRIORITY_CONFIG[pr];
                  return (
                    <button
                      key={pr}
                      onClick={() => {
                        onSetPriority(message.id, pr);
                        setShowPriorityMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium hover:opacity-80"
                      style={{ color: cfg.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => { onPin(message.id); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={
              message.pinned
                ? { background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }
                : { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }
            }
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
            </svg>
            {message.pinned ? "Épinglé" : "Épingler"}
          </button>

          <button
            onClick={() => { onArchive(message.id); onClose(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ml-auto"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
            </svg>
            Archiver
          </button>
        </div>

        {/* Reply input */}
        <div
          className="flex items-end gap-2 px-4 py-3"
          style={{
            borderTop: "1px solid var(--border)",
            paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
          }}
        >
          <textarea
            ref={inputRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Répondre via ${SOURCE_LABELS[message.source] ?? message.source}…`}
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none no-scrollbar"
            style={{
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              maxHeight: "100px",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
            style={{
              background: replyText.trim() ? "var(--accent)" : "var(--surface-2)",
              opacity: replyText.trim() ? 1 : 0.5,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
