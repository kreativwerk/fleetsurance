import type { Monatsquote } from "./typen";

/**
 * Schadensquote = Schadenaufwand (Zahlungen + Reserven) ÷ verdiente Prämie, in Prozent.
 * Ohne Prämie gibt es keine sinnvolle Quote.
 */
export function berechneQuote(schadenaufwandEuro: number, verdientePraemieEuro: number): number | null {
  if (verdientePraemieEuro <= 0) return null;
  return Math.round((schadenaufwandEuro / verdientePraemieEuro) * 1000) / 10;
}

/** Letzter Monat mit Daten, z. B. für die Hervorhebung im Diagramm. */
export function aktuellerMonat(quoten: Monatsquote[]): Monatsquote | undefined {
  return [...quoten].reverse().find((m) => m.quote !== null);
}

/** Veränderung in Prozentpunkten (negativ = besser). */
export function veraenderungPunkte(aktuell: number, vorjahr: number): number {
  return Math.round((aktuell - vorjahr) * 10) / 10;
}
