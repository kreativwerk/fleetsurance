/**
 * Datenzugriff (nur Server). Zwei Modi:
 * - „live“: Supabase mit Nutzer-Session; RLS entscheidet, was sichtbar ist.
 * - „demo“: synthetische Testdaten, wenn kein Supabase-Projekt konfiguriert ist.
 * Client-Komponenten bekommen Daten ausschließlich als Props, damit z. B. interne
 * Makler-Notizen nie im Browser-Bundle landen.
 */
import "server-only";
import { cache } from "react";
import * as testdaten from "@fleetsurance/domain/testdaten";
import type {
  DauerEvb,
  Fahrzeug,
  Lesestatus,
  Makler,
  Monatsquote,
  Nachricht,
  Schaden,
  SchadenStatus,
  Seite,
  Unternehmen,
} from "@fleetsurance/domain";
import { supabaseAktiv } from "./supabase/konfig";
import { supabaseServer } from "./supabase/server";

export type SchadenMitFahrzeug = Schaden & { fahrzeug: Fahrzeug };

export type Kontext = {
  modus: "demo" | "live";
  nutzer: { name: string; vorname: string; nachname: string; rolle: string; seite: Seite };
  unternehmen: (Unternehmen & { id: string }) | null;
  makler: Makler | null;
};

const rollenName: Record<string, string> = {
  makler_admin: "Makler-Admin",
  makler_mitarbeiter: "Makler",
  unternehmen_admin: "Unternehmens-Admin",
  fuhrparkleitung: "Fuhrparkleitung",
};

// ---------------------------------------------------------------------------
// Kontext: wer ist angemeldet, für welches Unternehmen?
// ---------------------------------------------------------------------------
export const ladeKontext = cache(async (): Promise<Kontext> => {
  if (!supabaseAktiv) {
    const { vorname, nachname, rolle, seite } = testdaten.nutzer;
    return {
      modus: "demo",
      nutzer: { name: `${vorname} ${nachname}`, vorname, nachname, rolle, seite },
      unternehmen: { id: "demo", ...testdaten.unternehmen },
      makler: testdaten.makler,
    };
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet");

  const { data: mitgliedschaften } = await sb
    .from("mitgliedschaften")
    .select("makler_id, unternehmen_id, rolle, vorname, nachname")
    .eq("user_id", user.id);
  const m = (mitgliedschaften ?? []).sort((a, b) => Number(!!b.unternehmen_id) - Number(!!a.unternehmen_id))[0];

  const vorname = m?.vorname ?? user.email?.split("@")[0] ?? "";
  const nachname = m?.nachname ?? "";
  const seite: Seite = m?.unternehmen_id ? "dsp" : "makler";

  let unternehmen: Kontext["unternehmen"] = null;
  if (m) {
    const abfrage = sb.from("unternehmen").select("id, name, station").order("name").limit(1);
    const { data } = m.unternehmen_id ? await abfrage.eq("id", m.unternehmen_id) : await abfrage.eq("makler_id", m.makler_id);
    const u = data?.[0];
    if (u) unternehmen = { id: u.id, name: u.name, station: u.station ?? "" };
  }

  let makler: Makler | null = null;
  if (m) {
    const { data } = await sb.from("makler").select("name, telefon, email").eq("id", m.makler_id).maybeSingle();
    if (data) makler = { name: data.name, telefon: data.telefon ?? "", email: data.email ?? "" };
  }

  return {
    modus: "live",
    nutzer: { name: [vorname, nachname].filter(Boolean).join(" "), vorname, nachname, rolle: rollenName[m?.rolle ?? ""] ?? "Ohne Zugang", seite },
    unternehmen,
    makler,
  };
});

// ---------------------------------------------------------------------------
// Fahrzeuge
// ---------------------------------------------------------------------------
type FahrzeugZeile = {
  id: string;
  kennzeichen: string;
  kennzeichen_ort: string | null;
  hersteller: string;
  modell: string;
  baujahr: number | null;
  antrieb: string | null;
  halterart: Fahrzeug["halterart"];
  status: Fahrzeug["status"];
  standort: string | null;
};

function alsFahrzeug(z: FahrzeugZeile): Fahrzeug {
  return {
    id: z.id,
    kennzeichen: z.kennzeichen,
    kennzeichenOrt: z.kennzeichen_ort ?? undefined,
    hersteller: z.hersteller,
    modell: z.modell,
    baujahr: z.baujahr ?? 0,
    antrieb: z.antrieb === "Elektro" ? "Elektro" : "Diesel",
    halterart: z.halterart,
    status: z.status,
    standort: z.standort ?? "",
  };
}

const FAHRZEUG_FELDER = "id, kennzeichen, kennzeichen_ort, hersteller, modell, baujahr, antrieb, halterart, status, standort";

export async function ladeFahrzeuge(): Promise<Fahrzeug[]> {
  const k = await ladeKontext();
  if (k.modus === "demo") return testdaten.fahrzeuge;
  if (!k.unternehmen) return [];
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("fahrzeuge")
    .select(FAHRZEUG_FELDER)
    .eq("unternehmen_id", k.unternehmen.id)
    .order("kennzeichen");
  if (error) throw new Error(`Fahrzeuge konnten nicht geladen werden: ${error.message}`);
  return (data as FahrzeugZeile[]).map(alsFahrzeug);
}

// ---------------------------------------------------------------------------
// Schäden
// ---------------------------------------------------------------------------
type SchadenZeile = {
  id: string;
  nummer: string;
  am: string;
  ort: string | null;
  art: string;
  schuldfrage: Schaden["schuldfrage"];
  polizei: boolean;
  status: SchadenStatus;
  schadensnummer_versicherer: string | null;
  aufwand_geschaetzt_cent: number | null;
  fahrzeuge: FahrzeugZeile;
  schaden_statusverlauf: { status: SchadenStatus; am: string }[];
};

const SCHADEN_FELDER = `id, nummer, am, ort, art, schuldfrage, polizei, status, schadensnummer_versicherer, aufwand_geschaetzt_cent,
  fahrzeuge!inner(${FAHRZEUG_FELDER}), schaden_statusverlauf(status, am)`;

function alsSchaden(z: SchadenZeile): SchadenMitFahrzeug {
  const fahrzeug = alsFahrzeug(z.fahrzeuge);
  return {
    id: z.nummer,
    fahrzeugId: fahrzeug.id,
    am: z.am,
    ort: z.ort ?? "",
    art: z.art,
    schuldfrage: z.schuldfrage,
    polizei: z.polizei,
    status: z.status,
    schadensnummerVersicherer: z.schadensnummer_versicherer ?? undefined,
    aufwandGeschaetztEuro: Math.round((z.aufwand_geschaetzt_cent ?? 0) / 100),
    statusVerlauf: [...z.schaden_statusverlauf].sort((a, b) => Date.parse(a.am) - Date.parse(b.am)),
    // Fotos und Dokumente folgen mit dem privaten Storage (M3).
    fotos: 0,
    dokumente: [],
    fahrzeug,
  };
}

function demoMitFahrzeug(s: Schaden): SchadenMitFahrzeug {
  const fahrzeug = testdaten.fahrzeuge.find((f) => f.id === s.fahrzeugId);
  if (!fahrzeug) throw new Error(`Fahrzeug ${s.fahrzeugId} fehlt`);
  return { ...s, fahrzeug };
}

/** Alle Schäden des Unternehmens, neueste zuerst. */
export async function ladeSchaeden(): Promise<SchadenMitFahrzeug[]> {
  const k = await ladeKontext();
  if (k.modus === "demo") {
    return [...testdaten.schaeden].sort((a, b) => Date.parse(b.am) - Date.parse(a.am)).map(demoMitFahrzeug);
  }
  if (!k.unternehmen) return [];
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("schaeden")
    .select(SCHADEN_FELDER)
    .eq("unternehmen_id", k.unternehmen.id)
    .order("am", { ascending: false });
  if (error) throw new Error(`Schäden konnten nicht geladen werden: ${error.message}`);
  return (data as unknown as SchadenZeile[]).map(alsSchaden);
}

export function istOffen(s: Schaden): boolean {
  return s.status !== "reguliert";
}

// ---------------------------------------------------------------------------
// Schadenakte mit Chat
// ---------------------------------------------------------------------------
export type Akte = {
  schaden: SchadenMitFahrzeug;
  nachrichten: Nachricht[];
  lesestatus: Lesestatus[];
};

export async function ladeAkte(nummer: string): Promise<Akte | null> {
  const k = await ladeKontext();
  if (k.modus === "demo") {
    const s = testdaten.schaeden.find((x) => x.id === nummer);
    if (!s) return null;
    return {
      schaden: demoMitFahrzeug(s),
      // Interne Makler-Notizen verlassen den Server nicht, wenn ein DSP schaut.
      nachrichten: testdaten.nachrichten.filter(
        (n) => n.schadenId === nummer && (n.sichtbarkeit === "alle" || k.nutzer.seite === "makler"),
      ),
      lesestatus: testdaten.lesestatus.filter((l) => l.schadenId === nummer),
    };
  }

  const sb = await supabaseServer();
  const { data: zeile } = await sb.from("schaeden").select(SCHADEN_FELDER).eq("nummer", nummer).maybeSingle();
  if (!zeile) return null;
  const schaden = alsSchaden(zeile as unknown as SchadenZeile);
  const schadenUuid = (zeile as unknown as SchadenZeile).id;

  const [{ data: zeilen }, { data: lese }] = await Promise.all([
    sb
      .from("schaden_nachrichten")
      .select("id, typ, seite, text, sichtbarkeit, anhang_name, anhang_groesse_kb, erstellt_am, zurueckgezogen_am")
      .eq("schaden_id", schadenUuid)
      .order("erstellt_am"),
    sb.from("schaden_lesestatus").select("seite, gelesen_bis").eq("schaden_id", schadenUuid),
  ]);

  const autorName = (seite: Seite | null) => (seite === "makler" ? (k.makler?.name ?? "Makler") : (k.unternehmen?.name ?? "Unternehmen"));
  const nachrichten: Nachricht[] = (zeilen ?? []).map((n) => ({
    id: n.id,
    schadenId: nummer,
    typ: n.typ,
    seite: n.seite ?? undefined,
    autor: n.typ === "nachricht" ? autorName(n.seite) : undefined,
    text: n.zurueckgezogen_am ? "Nachricht zurückgezogen" : n.text,
    am: n.erstellt_am,
    sichtbarkeit: n.sichtbarkeit,
    anhang: n.anhang_name && !n.zurueckgezogen_am ? { name: n.anhang_name, groesseKb: n.anhang_groesse_kb ?? 0 } : undefined,
    zurueckgezogenAm: n.zurueckgezogen_am ?? undefined,
  }));

  // Lesestatus kommt als Zeitpunkt; die Oberfläche arbeitet mit „gelesen bis Nachricht X“.
  const lesestatus: Lesestatus[] = (lese ?? []).flatMap((l) => {
    const bis = Date.parse(l.gelesen_bis);
    const letzte = nachrichten.filter((n) => Date.parse(n.am) <= bis).at(-1);
    return letzte ? [{ schadenId: nummer, seite: l.seite, gelesenBis: letzte.id }] : [];
  });

  return { schaden, nachrichten, lesestatus };
}

// ---------------------------------------------------------------------------
// Dauer-eVB und Schadensquote
// ---------------------------------------------------------------------------
export async function ladeDauerEvb(): Promise<DauerEvb[]> {
  const k = await ladeKontext();
  if (k.modus === "demo") return testdaten.dauerEvb;
  if (!k.unternehmen) return [];
  const sb = await supabaseServer();
  const { data } = await sb.from("dauer_evb").select("art, nummer").eq("unternehmen_id", k.unternehmen.id);
  const reihenfolge: DauerEvb["art"][] = ["arval", "allgemein"];
  return (data ?? []).sort((a, b) => reihenfolge.indexOf(a.art) - reihenfolge.indexOf(b.art));
}

export type Quoten = { jahr: number; monate: Monatsquote[]; aktuell: number | null; vorjahr: number | null; ziel: number };

const ZIELQUOTE = 50;

export async function ladeQuoten(): Promise<Quoten> {
  const k = await ladeKontext();
  if (k.modus === "demo") {
    const { jahr, aktuell, vorjahr, ziel } = testdaten.quoteJahr;
    return { jahr, monate: testdaten.monatsquoten2026, aktuell, vorjahr, ziel };
  }
  const jahr = Number(new Intl.DateTimeFormat("de-DE", { year: "numeric", timeZone: "Europe/Berlin" }).format(new Date()));
  const leer: Monatsquote[] = Array.from({ length: 12 }, (_, i) => ({ monat: i + 1, quote: null }));
  if (!k.unternehmen) return { jahr, monate: leer, aktuell: null, vorjahr: null, ziel: ZIELQUOTE };

  const sb = await supabaseServer();
  const { data } = await sb
    .from("monatsquoten")
    .select("jahr, monat, quote")
    .eq("unternehmen_id", k.unternehmen.id)
    .in("jahr", [jahr - 1, jahr]);
  const zeilen = data ?? [];
  const monate = leer.map((m) => ({ ...m, quote: zeilen.find((z) => z.jahr === jahr && z.monat === m.monat)?.quote ?? null }));
  // Bis zum Makler-Upload mit Aufwand und Prämie (M1) ist die Jahresquote der Mittelwert der Monatsquoten.
  const mittel = (j: number) => {
    const werte = zeilen.filter((z) => z.jahr === j).map((z) => Number(z.quote));
    return werte.length ? Math.round((werte.reduce((a, b) => a + b, 0) / werte.length) * 10) / 10 : null;
  };
  return { jahr, monate, aktuell: mittel(jahr), vorjahr: mittel(jahr - 1), ziel: ZIELQUOTE };
}
