import type { Lesestatus, Nachricht, Seite } from "./typen";

/**
 * Was eine Seite im Verlauf sehen darf. In der Datenbank erzwingt das später RLS;
 * diese Funktion spiegelt die Regel für UI und Tests.
 */
export function sichtbareNachrichten(nachrichten: Nachricht[], betrachter: Seite): Nachricht[] {
  return nachrichten
    .filter((n) => n.sichtbarkeit === "alle" || betrachter === "makler")
    .sort((a, b) => a.am.localeCompare(b.am));
}

/** Hat die Gegenseite die letzte eigene Nachricht gelesen? (Nur je Seite, ohne Personen/Uhrzeit.) */
export function vonGegenseiteGelesen(
  nachrichten: Nachricht[],
  lesestatus: Lesestatus[],
  eigeneSeite: Seite,
  schadenId: string,
): string | undefined {
  const gegenseite: Seite = eigeneSeite === "dsp" ? "makler" : "dsp";
  const eigene = nachrichten.filter((n) => n.schadenId === schadenId && n.seite === eigeneSeite && n.typ === "nachricht");
  const letzte = eigene.sort((a, b) => a.am.localeCompare(b.am)).at(-1);
  const status = lesestatus.find((l) => l.schadenId === schadenId && l.seite === gegenseite);
  if (!letzte || !status) return undefined;
  const gelesen = nachrichten.find((n) => n.id === status.gelesenBis);
  return gelesen && gelesen.am >= letzte.am ? letzte.id : undefined;
}

export function ungeleseneAnzahl(nachrichten: Nachricht[], lesestatus: Lesestatus[], seite: Seite, schadenId: string): number {
  const status = lesestatus.find((l) => l.schadenId === schadenId && l.seite === seite);
  const gelesen = status ? nachrichten.find((n) => n.id === status.gelesenBis) : undefined;
  return sichtbareNachrichten(nachrichten, seite).filter(
    (n) => n.schadenId === schadenId && n.typ === "nachricht" && n.seite !== seite && (!gelesen || n.am > gelesen.am),
  ).length;
}
