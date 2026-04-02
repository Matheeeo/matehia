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
  if (mins < 1) return "A l'instant";
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = useCallback(async (source: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const url = source === 'Tous' ? '/api/messages' : `/api/messages?source=${encodeURIComponent(source)}`;
      const res = await fetch(url);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(filter);
    const interval = setInterval(() => fetchMessages(filter, true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [filter, fetchMessages]);

  async function handleClick(msg: Message) {
    setSelected(msg);
    if (!msg.read) {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, action: 'read' }),
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  }

  async function handleArchive(id: string) {
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'archive' }),
    });
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  async function handleUrgent(id: string) {
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'urgent' }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, priority: 'haute', read: false } : m));
  }

  const urgent = messages.filter(m => !m.read && m.priority === 'haute');
  const toProcess = messages.filter(m => !m.read && m.priority !== 'haute');
  const read = messages.filter(m => m.read);
  const unreadCount = messages.filter(m => !m.read).length;
  const countBySource = messages.reduce<Record<string, number>>((acc, m) => {
    acc[m.source] = (acc[m.source] ?? 0) + (!m.read ? 1 : 0);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      <header className="px-4 pt-10 pb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-zinc-400">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {SOURCES.map(s => {
            const count = s === 'Tous' ? unreadCount : (countBySource[s] ?? 0);
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`shrink-0 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors ${
                  filter === s ? 'bg-white text-black font-medium' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {s}
                {count > 0 && (
                  <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center ${filter === s ? 'bg-black/20 text-black' : 'bg-zinc-600 text-zinc-300'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Chargement</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Aucun message</div>
        ) : (
          <>
            {urgent.length > 0 && (
              <section>
                <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">Urgent</p>
                <div className="space-y-2">
                  {urgent.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                </div>
              </section>
            )}
            {toProcess.length > 0 && (
              <section>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">A traiter</p>
                <div className="space-y-2">
                  {toProcess.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                </div>
              </section>
            )}
            {read.length > 0 && (
              <section>
                <p className="text-xs font-medium text-zinc-700 uppercase tracking-wider mb-2">Lu</p>
                <div className="space-y-2">
                  {read.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end z-50" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg mx-auto bg-zinc-900 rounded-t-2xl p-6 pb-10 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{selected.source}</span>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl leading-none">x</button>
            </div>
            <p className="font-semibold text-lg">{selected.sender}</p>
            {selected.summary && <p className="text-sm text-white/80 bg-zinc-800 rounded-lg px-3 py-2 leading-relaxed">{selected.summary}</p>}
            <p className="text-sm text-zinc-400 leading-relaxed">{selected.content}</p>
            <p className="text-xs text-zinc-600">{new Date(selected.date).toLocaleString('fr-FR')}</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { handleUrgent(selected.id); setSelected(null); }} className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium">Urgent</button>
              <button onClick={() => { handleArchive(selected.id); setSelected(null); }} className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-medium">Archiver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
