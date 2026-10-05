import type { FahrzeugStatus, Halterart, SchadenStatus } from "./typen";

export const schadenStatusLabel: Record<SchadenStatus, string> = {
  gemeldet: "Gemeldet",
  geprueft: "Geprüft",
  beim_versicherer: "Beim Versicherer",
  reguliert: "Reguliert",
};

export const schadenStatusReihenfolge: SchadenStatus[] = ["gemeldet", "geprueft", "beim_versicherer", "reguliert"];

export const fahrzeugStatusLabel: Record<FahrzeugStatus, string> = {
  aktiv: "Aktiv",
  werkstatt: "In Werkstatt",
  defleeted: "Defleeted",
};

export const halterartLabel: Record<Halterart, string> = {
  arval_leasing: "Arval-Leasing",
  eigentum: "Eigentum",
  miete: "Miete",
};

export const schuldfrageLabel = {
  eigen: "Eigenes Verschulden",
  gegner: "Gegner",
  ungeklaert: "Ungeklärt",
} as const;

export const monatKurz = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] as const;
