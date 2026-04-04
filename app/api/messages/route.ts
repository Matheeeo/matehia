import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zmimsvyxooweqefwlzyg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaW1zdnl4b293ZXFlZndsenlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzc0NTUsImV4cCI6MjA5MDcxMzQ1NX0.bgzxGe8stTToUYTPui-qN_jDMr7w08RRgmeNsY4KTSY';

const sbHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

function mapCanal(canal: string): string {
  return canal === 'outlook' ? 'Email' : canal.charAt(0).toUpperCase() + canal.slice(1);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    // Mapper le filtre source → canal Supabase
    const canalMap: Record<string, string> = {
      'Email': 'outlook',
      'SMS': 'sms',
      'WhatsApp': 'whatsapp',
      'LinkedIn': 'linkedin',
    };

    let url =
      `${SUPABASE_URL}/rest/v1/inbox` +
      `?archive=eq.false` +
      `&order=date_dernier_message.desc` +
      `&select=id,canal,expediteur_principal,date_dernier_message,lu,priorite,resume,dernier_message,id_destinataire,conversation_id`;

    if (source && source !== 'Tous' && canalMap[source]) {
      url += `&canal=eq.${encodeURIComponent(canalMap[source])}`;
    }

    const res = await fetch(url, { headers: sbHeaders, cache: 'no-store' });

    if (!res.ok) {
      const err = await res.text();
      console.error('[API] Supabase GET error:', res.status, err);
      throw new Error(`Supabase ${res.status}: ${err}`);
    }

    const rows = await res.json();

    const messages = rows.map((c: Record<string, unknown>) => ({
      id: c.id,
      source: mapCanal(c.canal as string),
      date: c.date_dernier_message,
      sender: c.expediteur_principal,
      content: c.dernier_message || c.resume || '',
      summary: c.resume || null,
      priority: (c.priorite as string)?.includes('Haute') ? 'haute' : null,
      read: c.lu,
      id_destinataire: c.id_destinataire || '',
      conversation_id: c.conversation_id || '',
    }));

    return NextResponse.json(messages);
  } catch (err) {
    console.error('[API] Caught error:', err);
    return NextResponse.json({ error: 'Erreur Supabase', detail: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json();

    let update: Record<string, unknown> = {};
    if (action === 'read')    update = { is_read: true };
    else if (action === 'archive') update = { status: 'archived' };
    else if (action === 'urgent')  update = { priority: 'high', is_read: false };
    else return NextResponse.json({ error: 'Action invalide' }, { status: 400 });

    const url = `${SUPABASE_URL}/rest/v1/conversations?id=eq.${id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify(update),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[API] Supabase PATCH error:', res.status, err);
      throw new Error(`Supabase PATCH ${res.status}: ${err}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API] PATCH caught error:', err);
    return NextResponse.json({ error: 'Erreur Supabase', detail: String(err) }, { status: 500 });
  }
}
