import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// URL du webhook n8n d'envoi Outlook
const N8N_OUTLOOK_WEBHOOK = 'https://primary-production-e72f3.up.railway.app/webhook/envoyer-outlook'

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const VALID_SOURCES = ['Email', 'SMS', 'WhatsApp', 'LinkedIn']

const CANAL_TO_SOURCE: Record<string, string> = {
  outlook: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
}

// ─── GET — liste des conversations ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!SUPABASE_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL not set' }, { status: 500 })
  }

  const url = new URL(request.url, 'http://localhost')
  const archived = url.searchParams.get('archived') === 'true'
  const search = url.searchParams.get('search') || ''
  const source = url.searchParams.get('source') || ''

  const parts: string[] = [
    `archive=eq.${archived}`,
    `order=date_dernier_message.desc`,
    `select=*`,
  ]

  if (source && VALID_SOURCES.includes(source)) {
    parts.push(`canal=eq.${source}`)
  }

  if (search) {
    parts.push(
      `or=(expediteur_principal.ilike.*${search}*,dernier_message.ilike.*${search}*,resume.ilike.*${search}*)`
    )
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/inbox?${parts.join('&')}`, {
      headers: HEADERS,
      cache: 'no-store',
    })

    const raw = await res.text()
    if (!res.ok) {
      console.error('[GET] Supabase error:', raw)
      return NextResponse.json({ error: raw }, { status: res.status })
    }

    let data: any[]
    try { data = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Invalid JSON from Supabase' }, { status: 500 })
    }

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 })
    }

    const mapped = data.map((row) => ({
      id: row.id,
      source: CANAL_TO_SOURCE[row.canal?.toLowerCase()] || row.canal,
      sender: row.expediteur_principal,
      date: row.date_dernier_message,
      read: row.lu,
      priority: row.priorite,
      summary: row.resume,
      archived: row.archive,
      recipientId: row.id_destinataire,
      conversationId: row.conversation_id,
      lastMessage: row.dernier_message,
    }))

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('[GET] Fetch error:', String(err))
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST — envoyer une réponse ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, message, canal, subject } = body

    if (!conversation_id || !message || !canal) {
      return NextResponse.json({ error: 'Champs manquants : conversation_id, message, canal' }, { status: 400 })
    }

    // Seul Email est supporté pour l'instant (pas de Twilio)
    if (canal !== 'Email') {
      return NextResponse.json(
        { error: `Canal "${canal}" non disponible pour l'instant. Seul Email est support\u00e9.` },
        { status: 422 }
      )
    }

    // 1. Récupérer l'email du contact depuis Supabase
    const convRes = await fetch(
      `${SUPABASE_URL}/rest/v1/conversations?id=eq.${conversation_id}&select=id,ai_summary,contacts(email,full_name)`,
      { headers: HEADERS, cache: 'no-store' }
    )

    if (!convRes.ok) {
      const err = await convRes.text()
      console.error('[POST] Supabase conv fetch error:', err)
      return NextResponse.json({ error: 'Impossible de r\u00e9cup\u00e9rer la conversation' }, { status: 500 })
    }

    const convData = await convRes.json()
    if (!convData || convData.length === 0) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    const conv = convData[0]
    const contactEmail = conv.contacts?.email

    if (!contactEmail) {
      return NextResponse.json({ error: 'Email du contact introuvable en base' }, { status: 422 })
    }

    // 2. Appeler le webhook n8n avec les paramètres attendus par le workflow
    const n8nPayload = {
      id_destinataire: contactEmail,
      message: message,
      conversation_id: conversation_id,
      subject: subject || conv.ai_summary || '(Sans objet)',
    }

    const n8nRes = await fetch(N8N_OUTLOOK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    })

    const n8nRaw = await n8nRes.text()

    if (!n8nRes.ok) {
      console.error('[POST] n8n error:', n8nRaw)
      return NextResponse.json({ error: `Erreur n8n : ${n8nRaw}` }, { status: 502 })
    }

    let n8nData: any
    try { n8nData = JSON.parse(n8nRaw) } catch { n8nData = { raw: n8nRaw } }

    return NextResponse.json({ success: true, message_id: n8nData?.message_id, to: contactEmail })
  } catch (err) {
    console.error('[POST] Error:', String(err))
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── PATCH — actions sur une conversation ────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
    }

    let update: Record<string, any> = {}
    if (action === 'read')           update = { is_read: true }
    else if (action === 'archive')   update = { status: 'archived' }
    else if (action === 'unarchive') update = { status: 'open' }
    else if (action === 'priority')  update = { priority: 'high' }
    else return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

    const res = await fetch(`${SUPABASE_URL}/rest/v1/conversations?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify(update),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH] Error:', String(err))
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
