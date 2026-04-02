'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const sourceColors: Record<string, string> = {
  WhatsApp: 'bg-green-500/20 text-green-400 border-green-500/30',
  LinkedIn: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Email: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SMS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Autre: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

type Message = {
  id: string;
  source: string;
  date: string;
  sender: string;
  content: string;
  summary: string | null;
  priority: string | null;
  read: boolean;
};

function timeAgo(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}j`;
}

function MessageCard({ message, onClick, onArchive, onUrgent }: {
  message: Message;
  onClick: (m: Message) => void;
  onArchive: (id: string) => void;
  onUrgent: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className={`absolute inset-0 flex items-center justify-start pl-4 transition-opacity ${offset > 72 ? 'opacity-100' : 'opacity-40'} bg-red-500/20`}>
        <span className="text-red-400 text-sm font-medium">Urgent</span>
      </div>
      <div className={`absolute inset-0 flex items-center justify-end pr-4 transition-opacity ${offset < -72 ? 'opacity-100' : 'opacity-40'} bg-zinc-700/40`}>
        <span className="text-zinc-400 text-sm font-medium">Archiver</span>
      </div>
      <button
        style={{ transform: `translateX(${offset}px)`, transition: dragging ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; setDragging(true); }}
        onTouchMove={(e) => { setOffset(Math.max(-120, Math.min(120, e.touches[0].clientX - startX.current))); }}
        onTouchEnd={() => {
          setDragging(false);
          if (offset > 72) onUrgent(message.id);
          else if (offset < -72) onArchive(message.id);
          setOffset(0);
        }}
        onClick={() => onClick(message)}
        className={`relative w-full text-left rounded-xl p-4 transition-colors ${
          message.priority === 'haute' ? 'bg-zinc-800 border border-red-500/30'
          : message.read ? 'bg-zinc-900 hover:bg-zinc-800/80'
          : 'bg-zinc-800 border border-zinc-700'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sourceColors[message.source] ?? sourceColors.Autre}`}>
              {message.source}
            </span>
            <span className="text-xs text-zinc-500 shrink-0">{timeAgo(message.date)}</span>
          </div>
          <p className={`text-sm font-medium ${message.read ? 'text-zinc-400' : 'text-white'}`}>
            {message.sender}
            {message.priority === 'haute' && <span className="ml-2 text-xs text-red-400 font-normal">urgent</span>}
          </p>
          <p className="text-sm text-zinc-500 truncate mt-0.5">{message.summary || message.content}</p>
        </div>
      </button>
    </div>
  );
}

const SOURCES = ['Tous', 'WhatsApp', 'LinkedIn', 'Email', 'SMS', 'Autre'];
const POLL_INTERVAL = 10000;

export default func
