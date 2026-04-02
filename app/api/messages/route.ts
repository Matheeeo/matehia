import { NextResponse } from "next/server";
import { MOCK_MESSAGES } from "@/lib/mockData";

// V1: static mock data. State managed client-side.
// Ready for Supabase integration in V2.

export async function GET() {
  return NextResponse.json(MOCK_MESSAGES);
}
