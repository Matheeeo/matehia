import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
  const { searchParams } = new URL(request.url)
  const archived = searchParams.get('archived') === 'true'
  const search = searchParams.get('search') || ''
  const source = searchParams.get('source') || ''

  const params = new URLSearchParams()
  params.set('archive', `eq.${archived}`)
  params.set('order', 'date_dernier_message.desc')
  params.set('select', '*')

  if (source && SOURCE_TO_CANAL[source]) {
    params.set('canal', `eq.${SOURCE_TO_CANAL[source]}`)
  }

  if (search) {
    const s = encodeURIComponent(`*${search}*`)
    params.set(
      'or',
      `(expediteur_principal.ilike.${s},dernier_message.ilike.${s},resume.ilike.${s})`
    )
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/inbox?${params}`, {
    headers: HEADERS,
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()

  const mapped = data.map((row: any) => ({
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
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, action } = body

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  }

  let update: Record<string, any> = {}

  if (action === 'read') update = { is_read: true }
  else if (action === 'archive') update = { status: 'archived' }
  else if (action === 'unarchive') update = { status: 'open' }
  else if (action === 'priority') update = { priority: 'high' }
  else return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/conversations?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: { ...HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify(update),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  return NextResponse.json({ success: true })
}
