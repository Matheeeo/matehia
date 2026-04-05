import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const CANAL_TO_SOURCE: Record<string, string> = {
  outlook: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
}

const SOURCE_TO_CANAL: Record<string, string> = Object.fromEntries(
  Object.entries(CANAL_TO_SOURCE).map(([k, v]) => [v, k])
)

export async function GET(request: NextRequest) {
  if (!SUPABASE_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL not set' }, { status: 500 })
  }

  const url = new URL(request.url, 'http://localhost')
  const archived = url.searchParams.get('archived') === 'true'
  const search = url.searchParams.get('search') || ''
  const source = url.searchParams.get('source') || ''

  // Construction manuelle pour éviter l'encodage de * par URLSearchParams
  const parts: string[] = [
    `archive=eq.${archived}`,
    `order=date_dernier_message.desc`,
    `select=*`,
  ]

  if (source && SOURCE_TO_CANAL[source]) {
    parts.push(`canal=eq.${SOURCE_TO_CANAL[source]}`)
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
      console.error('[route] Supabase error:', raw)
      return NextResponse.json({ error: raw }, { status: res.status })
    }

    let data: any[]
    try {
      data = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from Supabase' }, { status: 500 })
    }

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Unexpected response', detail: data }, { status: 500 })
    }

    const mapped = data.map((row) => ({
      id: row.id,
      source: CANAL_TO_SOURCE[row.canal] || row.canal,
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
    console.error('[route] Fetch error:', String(err))
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
    }

    // Enum conversation_status : open | in_progress | waiting | resolved | archived | spam
    let update: Record<string, any> = {}
    if (action === 'read')      update = { is_read: true }
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
    console.error('[route] PATCH error:', String(err))
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
