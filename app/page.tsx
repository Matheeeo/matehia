'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SUPABASE_URL = 'https://zmimsvyxooweqefwlzyg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaW1zdnl4b293ZXFlZndsenlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzc0NTUsImV4cCI6MjA5MDcxMzQ1NX0.bgzxGe8stTToUYTPui-qN_jDMr7w08RRgmeNsY4KTSY';
const POLL_INTERVAL = 10000;

const CANAL_CONFIG: Record<string, { color: string; bg: string }> = {
  WhatsApp: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  LinkedIn:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  Email:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  SMS:       { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  Autre:     { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
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
  id_destinataire: string;
  conversation_id: string;
};

function timeAgo(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'maintenant';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'hier' : `${days}j`;
}

function SourcePill({ source }: { source: string }) {
  const cfg = CANAL_CONFIG[source] ?? CANAL_CONFIG.Autre;
  return (
    <span style={{ color: cfg.color, background: cfg.bg }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full">
      <span style={{ background: cfg.color }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
      {source}
    </span>
  );
}

function MessageCard({ message, onClick, onArchive, onUrgent }: {
  message: Message;
  onClick: (m: Message) => void;
  onArchive: (id: string) => void;
  onUrgent: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [drag, setDrag] = useState(false);
  const startX = useRef(0);
  const urgent = message.priority === 'haute';

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div style={{ opacity: offset > 60 ? Math.min((offset - 60) / 50, 1) : 0, background: 'rgba(239,68,68,0.08)' }}
        className="absolute inset-0 flex items-center justify-start pl-5">
        <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Urgent</span>
      </div>
      <div style={{ opacity: offset < -60 ? Math.min((-offset - 60) / 50, 1) : 0 }}
        className="absolute inset-0 flex items-center justify-end pr-5 bg-white/5">
        <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">Archiver</span>
      </div>
      <button
        style={{
          transform: `translateX(${offset}px)`,
          transition: drag ? 'none' : 'transform 0.32s cubic-bezier(0.25,1,0.5,1)',
          background: urgent ? '#1a1119' : message.read ? '#0d0d0d' : '#141414',
          border: `1px solid ${urgent ? 'rgba(239,68,68,0.18)' : message.read ? 'transparent' : 'rgba(255,255,255,0.05)'}`,
        }}
        onTouchStart={e => { startX.current = e.touches[0].clientX; setDrag(true); }}
        onTouchMove={e => setOffset(Math.max(-120, Math.min(120, e.touches[0].clientX - startX.current)))}
        onTouchEnd={() => {
          setDrag(false);
          if (offset > 80) onUrgent(message.id);
          else if (offset < -80) onArchive(message.id);
          setOffset(0);
        }}
        onClick={() => onClick(message)}
        className="relative w-full text-left rounded-2xl px-4 py-3.5"
      >
        <div className="flex items-start gap-3">
          {!message.read && (
            <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: urgent ? '#ef4444' : '#7c3aed', boxShadow: `0 0 6px ${urgent ? '#ef444488' : '#7c3aed88'}` }} />
          )}
          {message.read && <span className="mt-1.5 w-2 h-2 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <SourcePill source={message.source} />
              <span className="text-xs flex-shrink-0" style={{ color: '#48484a' }}>{timeAgo(message.date)}</span>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: message.read ? '#48484a' : '#f5f5f7' }}>
              {message.sender}
            </p>
            <p className="text-sm truncate mt-0.5" style={{ color: '#3a3a3c' }}>
              {message.summary || message.content}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

const SOURCES = ['Tous', 'WhatsApp', 'LinkedIn', 'Email', 'SMS'];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

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
    setReply('');
    setSendStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 350);
    if (!msg.read) {
      fetch('/api/messages', {
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
    if (selected?.id === id) setSelected(null);
  }

  async function handleUrgent(id: string) {
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'urgent' }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, priority: 'haute', read: false } : m));
    if (selected?.id === id) setSelected(s => s ? { ...s, priority: 'haute' } : null);
  }

  async function handleSend() {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    setSendStatus('idle');
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({
          canal: selected.source === 'Email' ? 'Outlook' : selected.source,
          conversation_id: selected.conversation_id,
          id_destinataire: selected.id_destinataire,
          message: reply.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus('ok');
        setReply('');
        setTimeout(() => { setSelected(null); setSendStatus('idle'); fetchMessages(filter, true); }, 900);
      } else {
        setSendStatus('err');
      }
    } catch {
      setSendStatus('err');
    } finally {
      setSending(false);
    }
  }

  const urgent    = messages.filter(m => !m.read && m.priority === 'haute');
  const toProcess = messages.filter(m => !m.read && m.priority !== 'haute');
  const done      = messages.filter(m => m.read);
  const unread    = urgent.length + toProcess.length;
  const bySource  = messages.reduce<Record<string, number>>((a, m) => {
    if (!m.read) a[m.source] = (a[m.source] ?? 0) + 1;
    return a;
  }, {});

  return (
    <>
      <style>{`
        html,body{background:#000;-webkit-font-smoothing:antialiased;}
        .no-sb::-webkit-scrollbar{display:none;}
        .no-sb{-ms-overflow-style:none;scrollbar-width:none;}
        @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        .sheet{animation:su 0.36s cubic-bezier(0.32,0.72,0,1)both}
        .overlay{animation:fi 0.25s ease both}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin 0.8s linear infinite}
      `}</style>

      <div className="flex flex-col min-h-dvh max-w-lg mx-auto"
        style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif' }}>

        {/* Header */}
        <header className="px-5 pt-14 pb-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#7c3aed' }}>
                Matehia
              </p>
              <h1 className="text-[32px] font-bold tracking-tight leading-none text-white">Inbox</h1>
            </div>
            <div className="flex items-center gap-2 pb-1">
              {unread > 0 && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed', boxShadow: '0 0 8px #7c3aed' }} />
                  <span className="text-sm font-medium" style={{ color: '#9f7aea' }}>
                    {unread} non lu{unread > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-sb pb-0.5">
            {SOURCES.map(s => {
              const count = s === 'Tous' ? unread : (bySource[s] ?? 0);
              const active = filter === s;
              return (
                <button key={s} onClick={() => setFilter(s)}
                  style={active
                    ? { background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', boxShadow: '0 0 18px rgba(124,58,237,0.35)' }
                    : { background: '#1c1c1e', color: '#636366' }
                  }
                  className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-150"
                >
                  {s}
                  {count > 0 && (
                    <span style={active
                      ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
                      : { background: '#2c2c2e', color: '#a78bfa' }
                    } className="text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 pb-10 no-sb space-y-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-t-violet-500 spin" style={{ borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} />
              <p className="text-xs text-zinc-700 tracking-wide">Chargement</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 gap-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#1c1c1e' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="1" y="4" width="18" height="13" rx="2" stroke="#3a3a3c" strokeWidth="1.5"/>
                  <path d="M1 7l9 6 9-6" stroke="#3a3a3c" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm text-zinc-600">Aucun message</p>
            </div>
          ) : (
            <>
              {urgent.length > 0 && (
                <section>
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-red-500 mb-3 px-1">
                    Urgent
                  </p>
                  <div className="space-y-1.5">
                    {urgent.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                  </div>
                </section>
              )}
              {toProcess.length > 0 && (
                <section>
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3 px-1" style={{ color: '#7c3aed' }}>
                    A traiter
                  </p>
                  <div className="space-y-1.5">
                    {toProcess.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                  </div>
                </section>
              )}
              {done.length > 0 && (
                <section>
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-700 mb-3 px-1">Lu</p>
                  <div className="space-y-1.5">
                    {done.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="overlay absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            onClick={() => { setSelected(null); setReply(''); setSendStatus('idle'); }} />

          <div className="sheet relative w-full max-w-lg mx-auto rounded-t-3xl"
            style={{ background: '#161618', borderTop: '1px solid rgba(255,255,255,0.07)' }}>

            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full" style={{ background: '#3a3a3c' }} />
            </div>

            <div className="px-5 pt-2 pb-10 space-y-5">

              {/* Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <SourcePill source={selected.source} />
                    <span className="text-xs" style={{ color: '#48484a' }}>
                      {new Date(selected.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      {' · '}
                      {new Date(selected.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white truncate">{selected.sender}</p>
                </div>
                <button onClick={() => { setSelected(null); setReply(''); setSendStatus('idle'); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#2c2c2e' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="#636366" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="rounded-2xl px-4 py-3.5" style={{ background: '#1c1c1e' }}>
                <p className="text-[15px] leading-relaxed" style={{ color: '#e5e5ea' }}>{selected.content}</p>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleUrgent(selected.id)}
                  className="py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  Marquer urgent
                </button>
                <button onClick={() => handleArchive(selected.id)}
                  className="py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: '#2c2c2e', color: '#636366' }}>
                  Archiver
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

              {/* Reply */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: '#48484a' }}>
                  Repondre via {selected.source}
                </p>
                <div className="flex gap-2.5 items-end">
                  <div className="flex-1 rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <input
                      ref={inputRef}
                      value={reply}
                      onChange={e => { setReply(e.target.value); setSendStatus('idle'); }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Message..."
                      className="w-full px-4 py-3.5 text-[15px] bg-transparent outline-none"
                      style={{ color: '#f5f5f7' }}
                    />
                  </div>
                  <button onClick={handleSend} disabled={!reply.trim() || sending}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={reply.trim() && !sending
                      ? { background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 0 20px rgba(124,58,237,0.45)' }
                      : { background: '#2c2c2e', opacity: 0.5 }
                    }>
                    {sending ? (
                      <div className="w-4 h-4 rounded-full border-2 spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    ) : sendStatus === 'ok' ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 2.5L9 14l-2.5-4.5L2 7l11.5-4.5z" fill="white"/>
                      </svg>
                    )}
                  </button>
                </div>
                {sendStatus === 'err' && (
                  <p className="text-xs text-red-400 mt-2.5 px-1">Echec — verifie ta connexion</p>
                )}
                {sendStatus === 'ok' && (
                  <p className="text-xs mt-2.5 px-1" style={{ color: '#34d399' }}>Envoye</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
