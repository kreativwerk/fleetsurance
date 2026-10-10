"use server";

import { headers } from "next/headers";
import { supabaseAktiv } from "@/lib/supabase/konfig";
import { supabaseServer } from "@/lib/supabase/server";

export type LoginZustand = { status: "leer" | "gesendet" | "fehler"; meldung?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Sendet einen Login-Link. Neue Konten entstehen nur über Einladungen (shouldCreateUser: false).
 * Die Antwort verrät nicht, ob eine Adresse bekannt ist.
 */
export async function sendeLoginLink(_vorher: LoginZustand, formular: FormData): Promise<LoginZustand> {
  const email = String(formular.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return { status: "fehler", meldung: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  if (!supabaseAktiv) {
    return { status: "fehler", meldung: "Im Demo-Modus ist keine Anmeldung nötig." };
  }

  const kopf = await headers();
  const basis = process.env.NEXT_PUBLIC_APP_URL ?? `https://${kopf.get("host")}`;
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${basis}/auth/callback` },
  });
  if (error && error.status === 429) {
    return { status: "fehler", meldung: "Zu viele Versuche. Bitte warte einen Moment." };
  }
  return { status: "gesendet" };
}
