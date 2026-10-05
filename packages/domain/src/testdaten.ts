/**
 * Synthetische Testdaten. Alle Namen, Kennzeichen und Nummern sind erfunden.
 * Hier dürfen niemals echte personenbezogene Daten landen (CLAUDE.md).
 */
import type {
  DauerEvb,
  Fahrzeug,
  Lesestatus,
  Makler,
  Monatsquote,
  Nachricht,
  Nutzer,
  Schaden,
  Unternehmen,
} from "./typen";

export const HEUTE = "2026-10-05";

export const unternehmen: Unternehmen = { name: "Muster Logistik GmbH", station: "DXY1" };
export const nutzer: Nutzer = { vorname: "Anna", nachname: "Berger", rolle: "Fuhrparkleitung", seite: "dsp" };
export const makler: Makler = {
  name: "Muster Versicherungsmakler",
  telefon: "+49 30 1234567",
  email: "service@muster-makler.example",
};

export const dauerEvb: DauerEvb[] = [
  { art: "arval", nummer: "7Q4K2M9" },
  { art: "allgemein", nummer: "3HX8P5T" },
];

const modelle: Pick<Fahrzeug, "hersteller" | "modell" | "antrieb">[] = [
  { hersteller: "Mercedes-Benz", modell: "eSprinter", antrieb: "Elektro" },
  { hersteller: "Mercedes-Benz", modell: "Sprinter", antrieb: "Diesel" },
  { hersteller: "Ford", modell: "Transit", antrieb: "Diesel" },
  { hersteller: "Volkswagen", modell: "Crafter", antrieb: "Diesel" },
  { hersteller: "Mercedes-Benz", modell: "eSprinter", antrieb: "Elektro" },
];

const nummern = [
  2041, 2077, 3021, 3047, 3076, 3098, 3110, 3147, 3214, 3260, 3305, 3382, 4132, 4175, 4219, 4273, 4318, 4366, 4402,
  4455, 4519, 4587, 4630, 4698, 5112, 5189, 5230, 5274, 5321, 5368, 5410, 5463, 5517, 5562, 5608, 5655, 5701, 5749,
  5790, 5836, 5881, 5930, 6024, 6077, 6120, 6168, 6213, 7712,
];

export const fahrzeuge: Fahrzeug[] = nummern.map((nr, i) => {
  const m = modelle[i % modelle.length]!;
  const status: Fahrzeug["status"] = nr === 4132 || nr === 5930 ? "werkstatt" : nr === 7712 || nr === 6213 ? "defleeted" : "aktiv";
  return {
    id: `fz-${nr}`,
    kennzeichen: `BML${nr}`,
    kennzeichenOrt: "B",
    ...m,
    baujahr: 2022 + (i % 4),
    halterart: i % 3 === 2 ? "eigentum" : i % 7 === 6 ? "miete" : "arval_leasing",
    status,
    standort: "Berlin",
  };
});

export const monatsquoten2026: Monatsquote[] = [56, 52, 49, 45, 42, 40, 37, 34, 32, 31, null, null].map((quote, i) => ({
  monat: i + 1,
  quote,
}));

export const quoteJahr = { jahr: 2026, aktuell: 38, vorjahr: 52, ziel: 50 };

export const schaeden: Schaden[] = [
  {
    id: "SF-2026-0142",
    fahrzeugId: "fz-3021",
    am: "2026-10-02T14:20:00+02:00",
    ort: "Berlin-Tempelhof",
    art: "Unfall (Fahrzeugschaden)",
    schuldfrage: "gegner",
    polizei: true,
    status: "beim_versicherer",
    schadensnummerVersicherer: "VS-88412-26",
    aufwandGeschaetztEuro: 3850,
    statusVerlauf: [
      { status: "gemeldet", am: "2026-10-02T15:02:00+02:00" },
      { status: "geprueft", am: "2026-10-03T09:12:00+02:00" },
      { status: "beim_versicherer", am: "2026-10-03T10:20:00+02:00" },
    ],
    fotos: 4,
    dokumente: [
      { name: "Polizeibericht.pdf", groesseKb: 1228 },
      { name: "KVA_Werkstatt.pdf", groesseKb: 312 },
    ],
  },
  {
    id: "SF-2026-0139",
    fahrzeugId: "fz-3076",
    am: "2026-09-29T07:45:00+02:00",
    ort: "Berlin-Neukölln",
    art: "Diebstahl (Teile)",
    schuldfrage: "ungeklaert",
    polizei: true,
    status: "beim_versicherer",
    schadensnummerVersicherer: "VS-88377-26",
    aufwandGeschaetztEuro: 1240,
    statusVerlauf: [
      { status: "gemeldet", am: "2026-09-29T08:10:00+02:00" },
      { status: "geprueft", am: "2026-09-29T13:40:00+02:00" },
      { status: "beim_versicherer", am: "2026-09-30T09:05:00+02:00" },
    ],
    fotos: 2,
    dokumente: [{ name: "Anzeige_Diebstahl.pdf", groesseKb: 486 }],
  },
  {
    id: "SF-2026-0136",
    fahrzeugId: "fz-5189",
    am: "2026-09-26T18:05:00+02:00",
    ort: "Schönefeld",
    art: "Parkschaden",
    schuldfrage: "ungeklaert",
    polizei: false,
    status: "gemeldet",
    aufwandGeschaetztEuro: 760,
    statusVerlauf: [{ status: "gemeldet", am: "2026-09-26T18:30:00+02:00" }],
    fotos: 3,
    dokumente: [],
  },
  {
    id: "SF-2026-0128",
    fahrzeugId: "fz-4132",
    am: "2026-09-12T11:30:00+02:00",
    ort: "Berlin-Mitte",
    art: "Glasbruch",
    schuldfrage: "eigen",
    polizei: false,
    status: "reguliert",
    schadensnummerVersicherer: "VS-87920-26",
    aufwandGeschaetztEuro: 980,
    statusVerlauf: [
      { status: "gemeldet", am: "2026-09-12T12:00:00+02:00" },
      { status: "geprueft", am: "2026-09-12T16:20:00+02:00" },
      { status: "beim_versicherer", am: "2026-09-13T09:00:00+02:00" },
      { status: "reguliert", am: "2026-09-24T10:15:00+02:00" },
    ],
    fotos: 2,
    dokumente: [{ name: "Rechnung_Glas.pdf", groesseKb: 204 }],
  },
  {
    id: "SF-2026-0121",
    fahrzeugId: "fz-2041",
    am: "2026-08-28T06:50:00+02:00",
    ort: "B96, Höhe Zossen",
    art: "Wildunfall",
    schuldfrage: "ungeklaert",
    polizei: true,
    status: "reguliert",
    schadensnummerVersicherer: "VS-87511-26",
    aufwandGeschaetztEuro: 2310,
    statusVerlauf: [
      { status: "gemeldet", am: "2026-08-28T07:30:00+02:00" },
      { status: "geprueft", am: "2026-08-28T10:00:00+02:00" },
      { status: "beim_versicherer", am: "2026-08-28T14:00:00+02:00" },
      { status: "reguliert", am: "2026-09-15T09:30:00+02:00" },
    ],
    fotos: 5,
    dokumente: [{ name: "Wildunfallbescheinigung.pdf", groesseKb: 156 }],
  },
];

export const nachrichten: Nachricht[] = [
  {
    id: "n1",
    schadenId: "SF-2026-0142",
    typ: "status_ereignis",
    text: "Status geändert: Geprüft",
    am: "2026-10-03T09:12:00+02:00",
    sichtbarkeit: "alle",
  },
  {
    id: "n2",
    schadenId: "SF-2026-0142",
    typ: "nachricht",
    seite: "makler",
    autor: "Muster Versicherungsmakler",
    text: "Danke für die Meldung. Ich gebe den Fall heute an den Versicherer weiter.",
    am: "2026-10-03T09:15:00+02:00",
    sichtbarkeit: "alle",
  },
  {
    id: "n3",
    schadenId: "SF-2026-0142",
    typ: "status_ereignis",
    text: "Status geändert: Beim Versicherer",
    am: "2026-10-03T10:20:00+02:00",
    sichtbarkeit: "alle",
  },
  {
    id: "n4",
    schadenId: "SF-2026-0142",
    typ: "nachricht",
    seite: "makler",
    autor: "Muster Versicherungsmakler",
    text: "Interne Notiz: Sachbearbeiter beim Versicherer ist informiert, Rückruf zugesagt.",
    am: "2026-10-03T10:24:00+02:00",
    sichtbarkeit: "makler_intern",
  },
  {
    id: "n5",
    schadenId: "SF-2026-0142",
    typ: "nachricht",
    seite: "makler",
    autor: "Muster Versicherungsmakler",
    text: "Der Versicherer braucht noch den Kostenvoranschlag der Werkstatt.",
    am: "2026-10-03T15:42:00+02:00",
    sichtbarkeit: "alle",
  },
  {
    id: "n6",
    schadenId: "SF-2026-0142",
    typ: "nachricht",
    seite: "dsp",
    autor: "Anna Berger",
    text: "Anbei der KVA.",
    am: "2026-10-03T16:18:00+02:00",
    sichtbarkeit: "alle",
    anhang: { name: "KVA_Werkstatt.pdf", groesseKb: 312 },
  },
];

export const lesestatus: Lesestatus[] = [
  { schadenId: "SF-2026-0142", seite: "makler", gelesenBis: "n6" },
  { schadenId: "SF-2026-0142", seite: "dsp", gelesenBis: "n5" },
];
