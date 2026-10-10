import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./konfig";

/** Supabase-Client für Server-Komponenten, Server-Actions und Route-Handler (mit Nutzer-Session, RLS greift). */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (liste) => {
        try {
          liste.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // In Server-Komponenten nicht schreibbar; die Middleware erneuert die Session.
        }
      },
    },
  });
}
