import { NextRequest, NextResponse } from "next/server";
import {
  getMessages,
  markAsRead,
  archiveMessage,
  setUrgent,
  type Source,
} from "@/lib/notion";

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") as Source | null;
  try {
    const messages = await getMessages(source ?? undefined);
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Erreur Notion" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, action } = await req.json();
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  try {
    if (action === "archive") await archiveMessage(id);
    else if (action === "urgent") await setUrgent(id);
    else await markAsRead(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur Notion" }, { status: 500 });
  }
}
