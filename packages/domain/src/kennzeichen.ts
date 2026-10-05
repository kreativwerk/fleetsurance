/**
 * Zerlegung eines deutschen Kennzeichens in Unterscheidungszeichen (Ort) und
 * Erkennungsnummer, für die Darstellung als Schild.
 *
 * Liefert die Datenquelle (CoDriver, Cortex) den Ort mit, gewinnt immer dieser.
 * Sonst greift die Heuristik aus CoDriver (`LicensePlateParts.of`), damit beide
 * Apps dasselbe Schild zeigen. Sie kennt die echten Ortskürzel nicht:
 * `MAB123` wird zu `M` + `AB 123`, obwohl `MA` gemeint sein kann.
 */
export interface KennzeichenTeile {
  ort: string;
  rest: string;
}

export function normalisiereKennzeichen(roh: string): string {
  return roh.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function zerlegeKennzeichen(roh: string, ortAusQuelle?: string): KennzeichenTeile {
  const plate = normalisiereKennzeichen(roh);
  if (!plate) return { ort: "", rest: "" };

  if (ortAusQuelle) {
    const ort = normalisiereKennzeichen(ortAusQuelle);
    if (plate.startsWith(ort)) {
      return { ort, rest: formatiereRest(plate.slice(ort.length)) };
    }
  }

  const match = /^([A-ZÄÖÜ]+?)(\d.*)$/.exec(plate);
  const buchstaben = match?.[1] ?? plate;
  const ziffern = match?.[2] ?? "";
  const ortLaenge = buchstaben.length >= 5 ? 3 : buchstaben.length >= 4 ? 2 : 1;
  const schnitt = Math.min(ortLaenge, buchstaben.length);
  const ort = buchstaben.slice(0, schnitt);
  const mitte = buchstaben.slice(schnitt);
  const rest = [mitte, ziffern].filter((teil) => teil.length > 0).join(" ");
  return { ort, rest };
}

function formatiereRest(rest: string): string {
  const match = /^([A-ZÄÖÜ]*)(\d.*)?$/.exec(rest);
  if (!match) return rest;
  return [match[1], match[2]].filter((teil) => teil && teil.length > 0).join(" ");
}

/** Lesbare Form für Screenreader und Suche, z. B. „B ML 3021“. */
export function kennzeichenText(roh: string, ortAusQuelle?: string): string {
  const { ort, rest } = zerlegeKennzeichen(roh, ortAusQuelle);
  return [ort, rest].filter(Boolean).join(" ");
}
