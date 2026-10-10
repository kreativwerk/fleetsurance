"use server";

import { ladeKontext } from "@/lib/daten";
import { supabaseServer } from "@/lib/supabase/server";

type Ergebnis = { ok: true; id: string; am: string } | { ok: false; fehler: string };

const MAX_LAENGE = 5000;

async function schadenUuid(nummer: string): Promise<string | null> {
  const sb = await supabaseServer();
  const { data } = await sb.from("schaeden").select("id").eq("nummer", nummer).maybeSingle();
  return data?.id ?? null;
}

/**
 * Nachricht im Schaden-Chat senden. Seite, Autor und Mandant setzt die Datenbank (Trigger),
 * RLS prüft den Zugriff. Im Demo-Modus wird nichts gespeichert.
 */
export async function sendeNachricht(nummer: string, text: string): Promise<Ergebnis> {
  const inhalt = text.trim();
  if (!inhalt) return { ok: false, fehler: "Die Nachricht ist leer." };
  if (inhalt.length > MAX_LAENGE) return { ok: false, fehler: `Höchstens ${MAX_LAENGE} Zeichen.` };

  const kontext = await ladeKontext();
  if (kontext.modus === "demo") {
    return { ok: true, id: `demo-${crypto.randomUUID()}`, am: new Date().toISOString() };
  }

  const id = await schadenUuid(nummer);
  if (!id) return { ok: false, fehler: "Diesen Schaden gibt es nicht oder du hast keinen Zugriff." };

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("schaden_nachrichten")
    .insert({ schaden_id: id, text: inhalt })
    .select("id, erstellt_am")
    .single();
  if (error || !data) return { ok: false, fehler: "Senden fehlgeschlagen. Bitte versuche es erneut." };
  return { ok: true, id: data.id, am: data.erstellt_am };
}

/** Markiert den Verlauf für die eigene Seite (DSP oder Makler) als gelesen. */
export async function markiereGelesen(nummer: string): Promise<void> {
  const kontext = await ladeKontext();
  if (kontext.modus === "demo") return;
  const id = await schadenUuid(nummer);
  if (!id) return;
  const sb = await supabaseServer();
  await sb
    .from("schaden_lesestatus")
    .upsert({ schaden_id: id, seite: kontext.nutzer.seite, gelesen_bis: new Date().toISOString() });
}
