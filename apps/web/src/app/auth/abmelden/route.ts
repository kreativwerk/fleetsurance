import { NextResponse, type NextRequest } from "next/server";
import { supabaseAktiv } from "@/lib/supabase/konfig";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (supabaseAktiv) {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  }
  const ziel = request.nextUrl.clone();
  ziel.pathname = "/login";
  ziel.search = "";
  return NextResponse.redirect(ziel, { status: 303 });
}
