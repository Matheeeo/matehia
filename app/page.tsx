'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SUPABASE_URL = 'https://zmimsvyxooweqefwlzyg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaW1zdnl4b293ZXFlZndsenlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzc0NTUsImV4cCI6MjA5MDcxMzQ1NX0.bgzxGe8stTToUYTPui-qN_jDMr7w08RRgmeNsY4KTSY';
const SB_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};
const POLL_INTERVAL = 10000;

const CANAL_CFG: Record<string, { color: string; bg: string; border: string; glyph: string }> = {
  Email:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', glyph: '\u2709' },
  SMS:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  glyph: '\u2706' },
  WhatsApp: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  glyph: '\u25ce' },
  LinkedIn: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  glyph: 'in' },
  Autre:    { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', glyph: '?' },
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

type ThreadMsg = {
  body: string;
  direction: 'inbound' | 'outbound';
  sent_at: string;
};

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return 'maintenant';
  if (d < 3600) return `${Math.floor(d / 60)}min`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  const days = Math.floor(d / 86400);
  return days === 1 ? 'hier' : `${days}j`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function Pill({ source, small }: { source: string; small?: boolean }) {
  const cfg = CANAL_CFG[source] ?? CANAL_CFG.Autre;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: small ? 10 : 11, fontWeight: 600,
      padding: small ? '2px 7px' : '3px 9px', borderRadius: 99,
    }}>
      <span style={{ fontSize: small ? 8 : 9 }}>{cfg.glyph}</span>
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
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, marginBottom: 8 }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-start', paddingLeft: 20, background: 'rgba(239,68,68,0.06)',
        opacity: offset > 50 ? Math.min((offset - 50) / 60, 1) : 0, transition: 'opacity 0.1s',
      }}>
        <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Urgent</span>
      </div>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', paddingRight: 20, background: 'rgba(255,255,255,0.03)',
        opacity: offset < -50 ? Math.min((-offset - 50) / 60, 1) : 0, transition: 'opacity 0.1s',
      }}>
        <span style={{ color: '#52525b', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Archiver</span>
      </div>
      <div
        onClick={() => onClick(message)}
        onTouchStart={e => { startX.current = e.touches[0].clientX; setDrag(true); }}
        onTouchMove={e => setOffset(Math.max(-120, Math.min(120, e.touches[0].clientX - startX.current)))}
        onTouchEnd={() => {
          setDrag(false);
          if (offset > 80) onUrgent(message.id);
          else if (offset < -80) onArchive(message.id);
          setOffset(0);
        }}
        style={{
          transform: `translateX(${offset}px)`,
          transition: drag ? 'none' : 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          cursor: 'pointer',
          background: urgent
            ? 'linear-gradient(135deg,rgba(26,8,16,0.98),rgba(20,6,14,0.98))'
            : message.read ? 'rgba(12,12,14,0.95)' : 'rgba(16,16,20,0.98)',
          border: `1px solid ${urgent ? 'rgba(239,68,68,0.15)' : message.read ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 18, padding: '14px 16px',
          boxShadow: urgent
            ? '0 1px 0 inset rgba(239,68,68,0.08),0 8px 32px rgba(0,0,0,0.4)'
            : '0 1px 0 inset rgba(255,255,255,0.03),0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!message.read && (
              <span className="glow-dot" style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0, display: 'block',
                background: urgent ? '#ef4444' : '#7c3aed',
                boxShadow: `0 0 8px ${urgent ? 'rgba(239,68,68,0.6)' : 'rgba(124,58,237,0.6)'}`,
              }} />
            )}
            <Pill source={message.source} small />
            {urgent && <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', letterSpacing: '0.1em', textTransform: 'uppercase' }}>URGENT</span>}
          </div>
          <span style={{ fontSize: 11, color: '#3f3f46', fontWeight: 500 }}>{timeAgo(message.date)}</span>
        </div>
        <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: message.read ? 500 : 700, color: message.read ? '#52525b' : '#f4f4f5', letterSpacing: '-0.01em' }}>
          {message.sender}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: message.read ? '#3a3a3c' : '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
          {message.summary || message.content}
        </p>
      </div>
    </div>
  );
}

function ThreadBubble({ msg, sender }: { msg: ThreadMsg; sender: string }) {
  const out = msg.direction === 'outbound';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: out ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{
        maxWidth: '80%',
        background: out ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.06)',
        border: out ? 'none' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: out ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        boxShadow: out ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
      }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: out ? '#fff' : '#e4e4e7' }}>{msg.body}</p>
      </div>
      <span style={{ fontSize: 10, color: '#3f3f46', marginTop: 4, paddingLeft: out ? 0 : 4, paddingRight: out ? 4 : 0 }}>
        {out ? 'Vous' : sender} {'\u00b7'} {fmtTime(msg.sent_at)}
      </span>
    </div>
  );
}

const SOURCES = ['Tous', 'Email', 'SMS', 'WhatsApp', 'LinkedIn'];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [thread, setThread] = useState<ThreadMsg[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [sendError, setSendError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const localRead = useRef<Set<string>>(new Set());
  const localArchived = useRef<Set<string>>(new Set());

  const fetchMessages = useCallback(async (source: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const url = source === 'Tous' ? '/api/messages' : `/api/messages?source=${encodeURIComponent(source)}`;
      const res = await fetch(url);
      const data: Message[] = await res.json();
      if (!Array.isArray(data)) return;
      const merged = data
        .filter(m => !localArchived.current.has(m.id))
        .map(m => ({ ...m, read: localRead.current.has(m.id) ? true : m.read }));
      setMessages(merged);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchThread = useCallback(async (convUuid: string) => {
    setThreadLoading(true);
    setThread([]);
    try {
      const url = `${SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${convUuid}&order=sent_at.asc&select=body,direction,sent_at`;
      const res = await fetch(url, { headers: SB_HEADERS, cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setThread(Array.isArray(data) ? data : []);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(filter);
    const interval = setInterval(() => fetchMessages(filter, true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [filter, fetchMessages]);

  useEffect(() => {
    if (thread.length > 0 && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [thread]);

  async function handleClick(msg: Message) {
    setSelected(msg);
    setThread([]);
    setReply('');
    setSendStatus('idle');
    setSendError('');
    fetchThread(msg.id);
    setTimeout(() => inputRef.current?.focus(), 400);
    if (!msg.read) {
      localRead.current.add(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, action: 'read' }),
      });
    }
  }

  async function handleArchive(id: string) {
    localArchived.current.add(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) { setSelected(null); setThread([]); }
    fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'archive' }),
    });
  }

  async function handleUrgent(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, priority: 'haute', read: false } : m));
    if (selected?.id === id) setSelected(s => s ? { ...s, priority: 'haute' } : null);
    fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'urgent' }),
    });
  }

  async function handleSend() {
    if (!selected || !reply.trim() || sending) return;
    if (!selected.conversation_id || !selected.id_destinataire) {
      setSendStatus('err'); setSendError('Conversation introuvable'); return;
    }
    setSending(true); setSendStatus('idle'); setSendError('');
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
        setThread(prev => [...prev, { body: reply.trim(), direction: 'outbound', sent_at: new Date().toISOString() }]);
        setReply('');
        setTimeout(() => fetchThread(selected.id), 1200);
        setTimeout(() => setSendStatus('idle'), 2000);
      } else {
        setSendStatus('err'); setSendError(data.detail || data.error || 'Erreur inconnue');
      }
    } catch (e) {
      setSendStatus('err'); setSendError(String(e));
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

  function groupByDate(msgs: ThreadMsg[]) {
    const groups: { date: string; msgs: ThreadMsg[] }[] = [];
    for (const m of msgs) {
      const d = fmtDate(m.sent_at);
      const last = groups[groups.length - 1];
      if (last && last.date === d) last.msgs.push(m);
      else groups.push({ date: d, msgs: [m] });
    }
    return groups;
  }

  return (
    <>
      <style>{`
        html,body{background:#080808;margin:0;-webkit-font-smoothing:antialiased;}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{display:none;}
        input::placeholder{color:#3f3f46;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        .spin{animation:spin .8s linear infinite;}
        .glow-dot{animation:glow 2s ease-in-out infinite;}
      `}</style>

      <div style={{ minHeight: '100dvh', background: '#080808', fontFamily: '-apple-system,"SF Pro Display","SF Pro Text",system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, opacity: 0.018 }} />
        <div style={{ position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(124,58,237,0.06) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 430, margin: '0 auto', paddingBottom: 40 }}>
          <div style={{ padding: '56px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 6 }}>MATEHIA</div>
                <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fafafa', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>Inbox</h1>
              </div>
              {unread > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 99, padding: '6px 12px' }}>
                  <span className="glow-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 10px rgba(124,58,237,0.8)', display: 'block' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>{unread} non lu{unread > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {SOURCES.map(s => {
                const count = s === 'Tous' ? unread : (bySource[s] ?? 0);
                const active = filter === s;
                return (
                  <button key={s} onClick={() => setFilter(s)} style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 99,
                    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                    background: active ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.04)',
                    color: active ? '#fff' : '#52525b',
                    boxShadow: active ? '0 0 20px rgba(124,58,237,0.3),0 1px 0 inset rgba(255,255,255,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {s}
                    {count > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.15)', color: active ? '#fff' : '#a78bfa', borderRadius: 99, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '0 12px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
                <div className="spin" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#7c3aed', borderRightColor: 'rgba(124,58,237,0.2)' }} />
                <p style={{ color: '#3f3f46', fontSize: 13, margin: 0 }}>Chargement</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="4" width="18" height="13" rx="2" stroke="#3a3a3c" strokeWidth="1.5"/><path d="M1 7l9 6 9-6" stroke="#3a3a3c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <p style={{ color: '#3f3f46', fontSize: 14, margin: 0 }}>Aucun message</p>
              </div>
            ) : (
              <>
                {urgent.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.8)' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Urgent</span>
                    </div>
                    {urgent.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                  </div>
                )}
                {toProcess.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 6px rgba(124,58,237,0.8)' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.15em', textTransform: 'uppercase' }}>A traiter</span>
                    </div>
                    {toProcess.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                  </div>
                )}
                {done.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#27272a' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#3f3f46', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Lu</span>
                    </div>
                    {done.map(m => <MessageCard key={m.id} message={m} onClick={handleClick} onArchive={handleArchive} onUrgent={handleUrgent} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
          <div
            onClick={() => { setSelected(null); setThread([]); setReply(''); setSendStatus('idle'); setSendError(''); }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', animation: 'fadeIn 0.25s ease' }}
          />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 430, margin: '0 auto',
            background: 'linear-gradient(180deg,#111113 0%,#0d0d0f 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -40px 80px rgba(0,0,0,0.8),0 -1px 0 inset rgba(255,255,255,0.06)',
            animation: 'slideUp 0.38s cubic-bezier(0.22,1,0.36,1)',
            display: 'flex', flexDirection: 'column', maxHeight: '88dvh',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, background: '#27272a', borderRadius: 99 }} />
            </div>

            <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Pill source={selected.source} />
                    <span style={{ fontSize: 11, color: '#3f3f46' }}>
                      {new Date(selected.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      {' \u00b7 '}
                      {new Date(selected.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fafafa', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{selected.sender}</div>
                </div>
                <button
                  onClick={() => { setSelected(null); setThread([]); setReply(''); setSendStatus('idle'); setSendError(''); }}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginLeft: 12, fontFamily: 'inherit' }}>
                  {'\u2715'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                <button onClick={() => handleUrgent(selected.id)} style={{ padding: '10px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Marquer urgent</button>
                <button onClick={() => handleArchive(selected.id)} style={{ padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: '#52525b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Archiver</button>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />

            <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', minHeight: 0 }}>
              {threadLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, gap: 8 }}>
                  <div className="spin" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#7c3aed', borderRightColor: 'rgba(124,58,237,0.2)' }} />
                  <span style={{ color: '#3f3f46', fontSize: 12 }}>Chargement...</span>
                </div>
              ) : thread.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#3f3f46', fontSize: 13, margin: '20px 0' }}>Aucun message dans ce fil</p>
              ) : (
                groupByDate(thread).map(group => (
                  <div key={group.date}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 10px' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                      <span style={{ fontSize: 11, color: '#3f3f46', fontWeight: 600, letterSpacing: '0.04em' }}>{group.date}</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                    {group.msgs.map((m, i) => <ThreadBubble key={i} msg={m} sender={selected.sender} />)}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '12px 20px 32px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3f3f46', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
                Repondre via {selected.source}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ flex: 1, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1px solid ${reply ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s' }}>
                  <input
                    ref={inputRef}
                    value={reply}
                    onChange={e => { setReply(e.target.value); setSendStatus('idle'); setSendError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Message..."
                    style={{ width: '100%', padding: '14px 16px', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: '#fafafa', fontFamily: 'inherit' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!reply.trim() || sending}
                  style={{
                    width: 48, height: 48, borderRadius: 16, border: 'none',
                    cursor: reply.trim() && !sending ? 'pointer' : 'default',
                    background: reply.trim() && !sending ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: reply.trim() && !sending ? '0 0 24px rgba(124,58,237,0.4)' : 'none',
                    opacity: !reply.trim() || sending ? 0.4 : 1, transition: 'all 0.2s', fontFamily: 'inherit',
                  }}>
                  {sending ? (
                    <div className="spin" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  ) : sendStatus === 'ok' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 2.5L9 14l-2.5-4.5L2 7l11.5-4.5z" fill="white"/></svg>
                  )}
                </button>
              </div>
              {sendStatus === 'err' && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8, paddingLeft: 4 }}>{sendError || 'Echec envoi'}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
