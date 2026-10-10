import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAktiv, supabaseKey, supabaseUrl } from "@/lib/supabase/konfig";

/** Seiten, die ohne Anmeldung erreichbar sind. */
const OEFFENTLICH = ["/login", "/auth/"];

/**
 * 1. Content-Security-Policy mit Nonce pro Anfrage (Next.js setzt den Nonce auf seine Skripte).
 * 2. Supabase-Session erneuern und ohne Anmeldung zum Login umleiten (nur wenn Supabase aktiv ist).
 */
export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== "production";
  const supabaseHost = supabaseAktiv ? new URL(supabaseUrl).origin : "";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${supabaseHost ? ` ${supabaseHost}` : ""}`,
    "font-src 'self'",
    `connect-src 'self'${supabaseHost ? ` ${supabaseHost} ${supabaseHost.replace("https://", "wss://")}` : ""}${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (supabaseAktiv) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (liste) => {
          liste.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          liste.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // getUser() prüft das Token beim Auth-Server (nicht nur das Cookie).
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const pfad = request.nextUrl.pathname;
    if (!user && !OEFFENTLICH.some((p) => pfad.startsWith(p))) {
      const ziel = request.nextUrl.clone();
      ziel.pathname = "/login";
      ziel.search = "";
      const umleitung = NextResponse.redirect(ziel);
      umleitung.headers.set("Content-Security-Policy", csp);
      return umleitung;
    }
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image|icon.svg).*)" }],
};
