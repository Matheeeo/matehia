import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { searchParams } = new URL(request.url)
  const archived = searchParams.get('archived') === 'true'
  const search = searchParams.get('search') || ''
  const source = searchParams.get('source') || ''

  let query = supabase
    .from('inbox')
    .select('*')
    .eq('archive', archived)
    .order('date_dernier_message', { ascending: false })

  if (search) {
    query = query.or(
      `expediteur_principal.ilike.%${search}%,dernier_message.ilike.%${search}%,resume.ilike.%${search}%`
    )
  }

  if (source && SOURCE_TO_CANAL[source]) {
    query = query.eq('canal', SOURCE_TO_CANAL[source])
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mapped = (data || []).map((row: any) => ({
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
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
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

  const { error } = await supabase
    .from('conversations')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
