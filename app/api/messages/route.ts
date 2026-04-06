import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const N8N_OUTLOOK_WEBHOOK = 'https://primary-production-e72f3.up.railway.app/webhook/envoyer-outlook'

// POST — send reply via n8n Outlook webhook
export async function POST(request: NextRequest) {
  try {
    // Forward the user's JWT so Supabase RLS (has_profile) passes
    const authHeader = request.headers.get('authorization') ?? ''
    const HEADERS = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: authHeader || `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    }

    const body = await request.json()
    const { conversation_id, message, subject } = body

    if (!conversation_id || !message) {
      return NextResponse.json({ error: 'Missing conversation_id or message' }, { status: 400 })
    }

    // Fetch conversation + contact_id separately (avoids FK array normalisation issues)
    const convRes = await fetch(
      `${SUPABASE_URL}/rest/v1/conversations?id=eq.${conversation_id}&select=id,ai_summary,subject,contact_id`,
      { headers: HEADERS, cache: 'no-store' }
    )

    if (!convRes.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer la conversation' }, { status: 500 })
    }

    const convData = await convRes.json()
    if (!convData?.length) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    const conv = convData[0]
    if (!conv.contact_id) {
      return NextResponse.json({ error: 'Aucun contact lié à cette conversation' }, { status: 422 })
    }

    // Fetch contact email separately (no join = no array issue)
    const contactRes = await fetch(
      `${SUPABASE_URL}/rest/v1/contacts?id=eq.${conv.contact_id}&select=email`,
      { headers: HEADERS, cache: 'no-store' }
    )
    const contactData = await contactRes.json()
    const contactEmail = contactData?.[0]?.email
    if (!contactEmail) {
      return NextResponse.json({ error: 'Email du contact introuvable' }, { status: 422 })
    }

    // Call n8n webhook
    const n8nRes = await fetch(N8N_OUTLOOK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_destinataire: contactEmail,
        message,
        conversation_id,
        subject: subject || conv.subject || conv.ai_summary || '(Sans objet)',
      }),
    })

    const n8nRaw = await n8nRes.text()
    if (!n8nRes.ok) {
      return NextResponse.json({ error: `Erreur n8n : ${n8nRaw}` }, { status: 502 })
    }

    let n8nData: any
    try { n8nData = JSON.parse(n8nRaw) } catch { n8nData = {} }

    return NextResponse.json({ success: true, message_id: n8nData?.message_id, to: contactEmail })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
