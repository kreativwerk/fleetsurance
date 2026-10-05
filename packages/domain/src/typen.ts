export type Halterart = "arval_leasing" | "eigentum" | "miete";
export type FahrzeugStatus = "aktiv" | "werkstatt" | "defleeted";
export type SchadenStatus = "gemeldet" | "geprueft" | "beim_versicherer" | "reguliert";
export type Seite = "dsp" | "makler";

export interface Fahrzeug {
  id: string;
  kennzeichen: string;
  /** Unterscheidungszeichen aus der Quelle, falls bekannt. */
  kennzeichenOrt?: string;
  hersteller: string;
  modell: string;
  baujahr: number;
  antrieb: "Elektro" | "Diesel";
  halterart: Halterart;
  status: FahrzeugStatus;
  standort: string;
}

export interface Dokument {
  name: string;
  groesseKb: number;
}

export interface Schaden {
  id: string;
  fahrzeugId: string;
  /** ISO-Zeitpunkt des Schadens. */
  am: string;
  ort: string;
  art: string;
  schuldfrage: "eigen" | "gegner" | "ungeklaert";
  polizei: boolean;
  status: SchadenStatus;
  schadensnummerVersicherer?: string;
  aufwandGeschaetztEuro: number;
  statusVerlauf: { status: SchadenStatus; am: string }[];
  fotos: number;
  dokumente: Dokument[];
}

export interface Nachricht {
  id: string;
  schadenId: string;
  typ: "nachricht" | "status_ereignis";
  /** Wer geschrieben hat; bei Status-Ereignissen leer. */
  seite?: Seite;
  autor?: string;
  text: string;
  am: string;
  sichtbarkeit: "alle" | "makler_intern";
  anhang?: Dokument;
  zurueckgezogenAm?: string;
}

export interface Lesestatus {
  schadenId: string;
  seite: Seite;
  /** Bis zu welcher Nachricht diese Seite gelesen hat. */
  gelesenBis: string;
}

export interface DauerEvb {
  art: "arval" | "allgemein";
  nummer: string;
}

export interface Monatsquote {
  /** 1 = Januar */
  monat: number;
  /** Schadensquote in Prozent; `null` für Monate ohne Daten (Zukunft). */
  quote: number | null;
}

export interface Makler {
  name: string;
  telefon: string;
  email: string;
}

export interface Unternehmen {
  name: string;
  station: string;
}

export interface Nutzer {
  vorname: string;
  nachname: string;
  rolle: "Fuhrparkleitung" | "Makler";
  seite: Seite;
}
