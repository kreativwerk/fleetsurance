/**
 * Datenzugriff für M0: synthetische Testdaten aus @fleetsurance/domain.
 * Nur auf dem Server nutzbar: Client-Komponenten bekommen Daten ausschließlich als Props,
 * damit z. B. interne Makler-Notizen nie im Browser-Bundle landen.
 * Ab M1 kommen die Daten aus Supabase (RLS); die Signaturen bleiben gleich.
 */
import "server-only";
import * as testdaten from "@fleetsurance/domain/testdaten";
import type { Fahrzeug, Schaden } from "@fleetsurance/domain";

export { testdaten };

export const aktuelleSeite = testdaten.nutzer.seite;

export function fahrzeugZu(schaden: Schaden): Fahrzeug {
  const fahrzeug = testdaten.fahrzeuge.find((f) => f.id === schaden.fahrzeugId);
  if (!fahrzeug) throw new Error(`Fahrzeug ${schaden.fahrzeugId} fehlt`);
  return fahrzeug;
}

export function schadenNachId(id: string): Schaden | undefined {
  return testdaten.schaeden.find((s) => s.id === id);
}

export function offeneSchaeden(): Schaden[] {
  return testdaten.schaeden.filter((s) => s.status !== "reguliert");
}

export function schaedenNeuesteZuerst(): Schaden[] {
  return [...testdaten.schaeden].sort((a, b) => Date.parse(b.am) - Date.parse(a.am));
}

/** Was die App-Hülle (Client) über den angemeldeten Nutzer wissen darf. */
export function nutzerKurz() {
  const { vorname, nachname, rolle } = testdaten.nutzer;
  return { name: `${vorname} ${nachname}`, vorname, nachname, rolle };
}
