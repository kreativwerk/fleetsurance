import { describe, expect, it } from "vitest";
import { berechneQuote, aktuellerMonat, veraenderungPunkte } from "./quote";
import { kennzeichenText, zerlegeKennzeichen } from "./kennzeichen";
import { sichtbareNachrichten, ungeleseneAnzahl, vonGegenseiteGelesen } from "./chat";
import { fahrzeuge, lesestatus, monatsquoten2026, nachrichten, schaeden } from "./testdaten";

describe("Kennzeichen", () => {
  it("folgt der CoDriver-Heuristik", () => {
    expect(zerlegeKennzeichen("ERHAL321")).toEqual({ ort: "ERH", rest: "AL 321" });
    expect(zerlegeKennzeichen("FUDE319")).toEqual({ ort: "FU", rest: "DE 319" });
    expect(zerlegeKennzeichen("B-ML 3021")).toEqual({ ort: "B", rest: "ML 3021" });
  });

  it("bevorzugt den Ort aus der Quelle", () => {
    expect(zerlegeKennzeichen("MAB123")).toEqual({ ort: "M", rest: "AB 123" });
    expect(zerlegeKennzeichen("MAB123", "MA")).toEqual({ ort: "MA", rest: "B 123" });
  });

  it("liefert lesbaren Text und kommt mit Leerem klar", () => {
    expect(kennzeichenText("bml3021", "B")).toBe("B ML 3021");
    expect(zerlegeKennzeichen("  ")).toEqual({ ort: "", rest: "" });
  });
});

describe("Schadensquote", () => {
  it("rechnet Aufwand durch Prämie", () => {
    expect(berechneQuote(38_000, 100_000)).toBe(38);
    expect(berechneQuote(1, 3)).toBe(33.3);
    expect(berechneQuote(500, 0)).toBeNull();
  });

  it("findet den letzten Monat mit Daten", () => {
    expect(aktuellerMonat(monatsquoten2026)).toEqual({ monat: 10, quote: 31 });
  });

  it("gibt Veränderung in Punkten", () => {
    expect(veraenderungPunkte(38, 52)).toBe(-14);
  });
});

describe("Chat pro Schadensfall", () => {
  it("versteckt interne Makler-Notizen vor dem DSP", () => {
    const dsp = sichtbareNachrichten(nachrichten, "dsp");
    const makler = sichtbareNachrichten(nachrichten, "makler");
    expect(dsp.some((n) => n.sichtbarkeit === "makler_intern")).toBe(false);
    expect(makler.some((n) => n.sichtbarkeit === "makler_intern")).toBe(true);
  });

  it("meldet gelesen nur je Seite", () => {
    expect(vonGegenseiteGelesen(nachrichten, lesestatus, "dsp", "SF-2026-0142")).toBe("n6");
  });

  it("zählt ungelesene Nachrichten der Gegenseite", () => {
    expect(ungeleseneAnzahl(nachrichten, lesestatus, "dsp", "SF-2026-0142")).toBe(0);
    expect(ungeleseneAnzahl(nachrichten, [], "dsp", "SF-2026-0142")).toBe(2);
  });
});

describe("Testdaten", () => {
  it("haben 48 Fahrzeuge mit eindeutigen Kennzeichen", () => {
    expect(fahrzeuge).toHaveLength(48);
    expect(new Set(fahrzeuge.map((f) => f.kennzeichen)).size).toBe(48);
  });

  it("verweisen nur auf existierende Fahrzeuge", () => {
    const ids = new Set(fahrzeuge.map((f) => f.id));
    expect(schaeden.every((s) => ids.has(s.fahrzeugId))).toBe(true);
  });
});
