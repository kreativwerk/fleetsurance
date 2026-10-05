/**
 * Datenzugriff für M0: synthetische Testdaten aus @fleetsurance/domain.
 * Ab M1 kommen die Daten aus Supabase (RLS); die Signaturen bleiben gleich.
 */
import { testdaten, type Fahrzeug, type Schaden } from "@fleetsurance/domain";

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
  return [...testdaten.schaeden].sort((a, b) => b.am.localeCompare(a.am));
}

export function initialen(vorname: string, nachname: string): string {
  return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase();
}
