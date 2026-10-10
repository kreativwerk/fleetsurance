import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Rückkehr aus dem Login-Link: Session anlegen und offene Einladungen für diese Adresse annehmen. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const ziel = request.nextUrl.clone();
  ziel.search = "";

  if (!code) {
    ziel.pathname = "/login";
    ziel.searchParams.set("fehler", "link");
    return NextResponse.redirect(ziel);
  }

  const sb = await supabaseServer();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    ziel.pathname = "/login";
    ziel.searchParams.set("fehler", "link");
    return NextResponse.redirect(ziel);
  }

  await sb.rpc("einladungen_annehmen");
  ziel.pathname = "/uebersicht";
  return NextResponse.redirect(ziel);
}
