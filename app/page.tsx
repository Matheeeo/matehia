'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Msg = {
  id: string
  source: string
  sender: string
  date: string
  read: boolean
  priority: string
  summary: string | null
  archived: boolean
  recipientId: string
  conversationId: string
  lastMessage: string
}

type ThreadMsg = {
  id: string
  body: string
  direction: 'inbound' | 'outbound'
  sent_at: string
}

type Toast = { id: number; text: string }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'maintenant'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Aujourd\u2019hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
}

function groupByDate(msgs: ThreadMsg[]): [string, ThreadMsg[]][] {
  const map: Record<string, ThreadMsg[]> = {}
  for (const m of msgs) {
    const key = formatDateLabel(m.sent_at)
    if (!map[key]) map[key] = []
    map[key].push(m)
  }
  return Object.entries(map)
}

function getPriorityColor(priority: string): string {
  if (!priority) return '#6b7280'
  const p = priority.toLowerCase()
  if (p.includes('haute') || p === 'high' || p === 'urgent') return '#ef4444'
  if (p.includes('moyenne') || p === 'normal') return '#f59e0b'
  return '#6b7280'
}

const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  textarea::placeholder { color: rgba(255,255,255,0.3); }
  input::placeholder { color: rgba(255,255,255,0.3); }
  input { -webkit-tap-highlight-color: transparent; }
`

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox')
  const [selected, setSelected] = useState<Msg | null>(null)
  const [thread, setThread] = useState<ThreadMsg[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [archiving, setArchiving] = useState(false)

  const localRead = useRef<Set<string>>(new Set())
  const localArchived = useRef<Set<string>>(new Set())
  const localUnarchived = useRef<Set<string>>(new Set())
  const threadRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()
  const toastCounter = useRef(0)

  // Debounce recherche
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  const showToast = (text: string) => {
    const id = ++toastCounter.current
    setToasts((prev) => [...prev, { id, text }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }

  const fetchMessages = useCallback(async () => {
    const params = new URLSearchParams()
    if (activeTab === 'archived') params.set('archived', 'true')
    if (debouncedSearch) params.set('search', debouncedSearch)

    try {
      const res = await fetch(`/api/messages?${params}`)
      const data: Msg[] = await res.json()

      const filtered = data
        .filter((m) => {
          if (activeTab === 'inbox') return !localArchived.current.has(m.id)
          if (activeTab === 'archived') return !localUnarchived.current.has(m.id)
          return true
        })
        .map((m) => ({
          ...m,
          read: localRead.current.has(m.id) ? true : m.read,
        }))

      setMessages(filtered)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeTab, debouncedSearch])

  useEffect(() => {
    setLoading(true)
    setMessages([])
    fetchMessages()
    clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchMessages, 10000)
    return () => clearInterval(pollRef.current)
  }, [fetchMessages])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [thread])

  const openConversation = async (msg: Msg) => {
    setSelected(msg)
    setThread([])
    setThreadLoading(true)

    if (!msg.read && !localRead.current.has(msg.id)) {
      localRead.current.add(msg.id)
      fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, action: 'read' }),
      })
    }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${msg.id}&order=sent_at.asc`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      )
      setThread(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setThreadLoading(false)
    }
  }

  const handleArchiveToggle = async (msg: Msg) => {
    const isArchiving = activeTab === 'inbox'
    setArchiving(true)

    // Optimistic : retire de la liste courante immédiatement
    if (isArchiving) localArchived.current.add(msg.id)
    else localUnarchived.current.add(msg.id)
    setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    setSelected(null)

    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, action: isArchiving ? 'archive' : 'unarchive' }),
      })

      if (!isArchiving) {
        // Désarchivage : on vide le flag local et on bascule vers Inbox
        localUnarchived.current.delete(msg.id)
        showToast('Conversation restaur\u00e9e dans la bo\u00eete de r\u00e9ception')
        setActiveTab('inbox')
        setSearchQuery('')
        // Le changement d'activeTab déclenche fetchMessages via useEffect
      } else {
        showToast('Conversation archiv\u00e9e')
      }
    } catch (e) {
      console.error(e)
      showToast('Erreur — r\u00e9essaie')
    } finally {
      setArchiving(false)
    }
  }

  const sendReply = async () => {
  if (!selected || !replyText.trim() || sending) return
  setSending(true)
  setSendError('')

  if (selected.source !== 'Email') {
    setSendError(`R\u00e9ponse via ${selected.source} non disponible pour l\u2019instant`)
    setSending(false)
    return
  }

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: selected.id,
        canal: 'Email',
        message: replyText,
        subject: selected.summary || undefined,
      }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      setThread((prev) => [
        ...prev,
        {
          id: data.message_id || `local-${Date.now()}`,
          body: replyText,
          direction: 'outbound' as const,
          sent_at: new Date().toISOString(),
        },
      ])
      setReplyText('')
    } else {
      setSendError(data.error || 'Envoi \u00e9chou\u00e9')
    }
  } catch (e) {
    console.error(e)
    setSendError('Erreur r\u00e9seau')
  } finally {
    setSending(false)
  }
}

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: selected.id,
        canal: 'Email',
        message: replyText,
        subject: selected.summary || undefined,
      }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      setThread((prev) => [
        ...prev,
        {
          id: data.message_id || `local-${Date.now()}`,
          body: replyText,
          direction: 'outbound',
          sent_at: new Date().toISOString(),
        },
      ])
      setReplyText('')
    } else {
      console.error('[sendReply]', data)
      setSendError(data.error || 'Envoi \u00e9chou\u00e9')
    }
  } catch (e) {
    console.error(e)
    setSendError('Erreur r\u00e9seau')
  } finally {
    setSending(false)
  }
}
  const switchTab = (tab: 'inbox' | 'archived') => {
    setActiveTab(tab)
    setSearchQuery('')
    setSelected(null)
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 18px', fontSize: 13, color: '#f5f5f5', backdropFilter: 'blur(12px)', animation: 'toastIn 0.2s ease', whiteSpace: 'nowrap' }}>
            {t.text}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>

        {/* Header sticky */}
        <div style={{ position: 'sticky', top: 0, background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)', zIndex: 10 }}>
          <div style={{ padding: '52px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Matehia</h1>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 10px #7c3aed' }} />
            </div>

            {/* Barre de recherche */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="white" strokeWidth="1.5" />
                <path d="M10 10l3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 36px', color: '#f5f5f5', fontSize: 14, outline: 'none' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}>
                  {'\u00d7'}
                </button>
              )}
            </div>

            {/* Onglets */}
            <div style={{ display: 'flex', gap: 6, paddingBottom: 12 }}>
              {(['inbox', 'archived'] as const).map((tab) => (
                <button key={tab} onClick={() => switchTab(tab)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.18s', background: activeTab === tab ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                  {tab === 'inbox' ? 'Bo\u00eete de r\u00e9ception' : 'Archives'}
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>

        {/* Liste messages */}
        <div style={{ paddingBottom: 80 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
              <div style={{ width: 22, height: 22, border: '2px solid rgba(124,58,237,0.25)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{searchQuery ? '\u{1F50D}' : activeTab === 'archived' ? '\u{1F5C4}' : '\u2709'}</div>
              <div style={{ fontSize: 15 }}>{searchQuery ? 'Aucune conversation trouv\u00e9e' : activeTab === 'archived' ? 'Aucune conversation archiv\u00e9e' : 'Bo\u00eete vide'}</div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id} onClick={() => openConversation(msg)}
                style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', animation: `fadeIn 0.25s ease ${Math.min(i * 0.04, 0.3)}s both`, transition: 'background 0.12s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(124,58,237,0.08))', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, position: 'relative' }}>
                    {(msg.sender || '?').charAt(0).toUpperCase()}
                    {!msg.read && <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#7c3aed', border: '2px solid #080808' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: msg.read ? 400 : 600, fontSize: 15, color: msg.read ? 'rgba(255,255,255,0.7)' : '#fff' }}>{msg.sender || 'Inconnu'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>{timeAgo(msg.date)}</span>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: getPriorityColor(msg.priority) }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 5 }}>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, letterSpacing: 0.3, background: 'rgba(124,58,237,0.12)', color: 'rgba(155,92,255,0.9)', border: '1px solid rgba(124,58,237,0.18)' }}>{msg.source}</span>
                    </div>
                    {msg.summary && (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 3, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{msg.summary}</p>
                    )}
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{msg.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom sheet */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ background: '#0f0f0f', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', display: 'flex', flexDirection: 'column', maxHeight: '88vh', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>

            {/* Header sheet */}
            <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 5 }}>{selected.sender}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.12)', color: 'rgba(155,92,255,0.9)', border: '1px solid rgba(124,58,237,0.18)' }}>{selected.source}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>{new Date(selected.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleArchiveToggle(selected)}
                    disabled={archiving}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', color: archiving ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)', cursor: archiving ? 'default' : 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {archiving ? (
                      <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                    ) : null}
                    {activeTab === 'archived' ? 'D\u00e9sarchiver' : 'Archiver'}
                  </button>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 18 }}>
                    {'\u00d7'}
                  </button>
                </div>
              </div>

              {selected.summary && (
                <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.14)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(155,92,255,0.7)', marginBottom: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>R\u00e9sum\u00e9 IA</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{selected.summary}</div>
                </div>
              )}
            </div>

            {/* Thread */}
            <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
              {threadLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(124,58,237,0.25)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                </div>
              ) : (
                groupByDate(thread).map(([date, msgs]) => (
                  <div key={date}>
                    <div style={{ textAlign: 'center', margin: '12px 0', fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: 0.4 }}>{date}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msgs.map((m) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: m.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '74%', padding: '10px 14px', borderRadius: m.direction === 'outbound' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.direction === 'outbound' ? '#7c3aed' : 'rgba(255,255,255,0.07)', fontSize: 14, lineHeight: 1.5 }}>
                            {m.body}
                            <div style={{ fontSize: 10, color: m.direction === 'outbound' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)', marginTop: 4, textAlign: 'right' }}>
                              {new Date(m.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Réponse — inbox seulement */}
            {activeTab === 'inbox' && (
              <div style={{ padding: '10px 16px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                    placeholder={`R\u00e9pondre via ${selected.source}...`} rows={1}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '11px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.45, maxHeight: 100, overflowY: 'auto' }}
                  />
                  <button onClick={sendReply} disabled={!replyText.trim() || sending}
                    style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: replyText.trim() && !sending ? '#7c3aed' : 'rgba(124,58,237,0.25)', border: 'none', cursor: replyText.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {sending ? (
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 8L2.5 2.5l2.5 5.5-2.5 5.5 11-5.5z" fill="white" /></svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
