# Mobile-Design: Planung

Grundlage: freigegebener Desktop-Entwurf S3 (`.impeccable/mocks/final-s3-*.png`), SUM-Palette, PRODUCT.md.
Version 1 ist eine responsive Web-App (PWA). Die Flutter-App folgt in Phase 2 mit denselben Tokens.

## Wer nutzt mobil, und wofür?

| Rolle | Mobile Situation | Wichtigste Aufgaben |
|---|---|---|
| Fuhrparkleiter (DSP) | Morgens an der Station, zwischen den Touren, im Transporter | Schaden melden, Dauer-eVB kopieren oder teilen, Status von Schäden, Fahrzeug nachschlagen (Kennzeichen oder QR) |
| Makler | Unterwegs beim Kunden | Neue Schäden ansehen, Kunden anrufen, Quote eines Kunden nachsehen (vor allem lesen) |

## Breakpoints

| Breite | Layout |
|---|---|
| ≥ 1280 px | Desktop: schwarze Icon-Leiste, zwei Spalten (Inhalt + rechte Spalte mit eVB und Makler) |
| 768–1279 px | Tablet: Icon-Leiste, eine Inhaltsspalte; die rechte Spalte rutscht als Kartenreihe unter die Kennzahlen |
| < 768 px | Mobil: untere Tab-Leiste, eine Spalte, Karten in voller Breite |

## Navigation mobil

Untere Tab-Leiste (sicherer Bereich beachtet, Ziele mindestens 48 px groß):

**Übersicht · Flotte · [＋ Schaden melden] · Schäden · Mehr**

- „Schaden melden“ ist der schwarze runde Knopf in der Mitte, die wichtigste Handlung.
- „Mehr“ enthält Dauer-eVB, Dokumente, Datenquellen, Mein Makler und Einstellungen.
- Auf Mobil gibt es kein Seitenmenü und kein Burger-Menü.

## Reihenfolge auf der Übersicht (mobil)

1. Kopf: Logo, Firmenauswahl (Pille), Initialen-Avatar
2. **Schadensquote** (schwarze Karte) mit Monatsbalken; der aktuelle Monat ist hervorgehoben
3. Zwei Kennzahlen nebeneinander: Fahrzeuge · Offene Schäden
4. **Dauer-eVB** (blaue Karte): zwei Zeilen „Arval-Leasing“ und „Alle anderen Fahrzeuge“.
   Jede Zeile hat einen eigenen Knopf zum Kopieren. „Teilen“ nutzt das native Teilen-Menü des Geräts (Web Share API).
5. Letzte Schäden: Kennzeichen (`compact`, 40 px), Schadenart und Status
6. Mein Makler: Knöpfe für Anrufen (`tel:`) und Nachricht

## Flotte (mobil)

- Suche: Kennzeichen, Modell oder FIN. Daneben Knöpfe für Filter und Sortierung (öffnen ein Bottom-Sheet).
- Status-Pillen zum horizontalen Wischen: Alle · Aktiv · Werkstatt · Defleeted
- Fahrzeugkarte **ohne VIN-QR-Code** (Entscheidung des Nutzers, 2026-10-05): das Kennzeichen (40 px), darunter ein Badge für die Halterart (Arval-Leasing / Eigentum / Miete), dann Modell, Baujahr und Antrieb, dazu ein Status-Chip. Die Karten sind dadurch kompakter.
- Ein Tippen öffnet das Fahrzeug.

## Schaden melden (mobil, wichtigster Ablauf)

Ein Ablauf über den ganzen Bildschirm in fünf Schritten, mit Fortschrittsbalken oben:

1. **Fahrzeug:** suchen oder den QR-Code am Fahrzeug scannen; das Kennzeichen wird groß angezeigt (`detail`)
2. **Wann und wo:** Zeitpunkt ist mit „jetzt“ vorbelegt. Ort per GPS nur nach ausdrücklicher Zustimmung, sonst als Freitext.
3. **Fotos:** über die Kamera, mehrere Fotos möglich. Sie werden vor dem Hochladen verkleinert, und die Metadaten (EXIF, inklusive GPS) werden entfernt.
4. **Was ist passiert:** Schadenart, Schuldfrage, Polizei ja/nein, Unfallgegner (Kennzeichen, Versicherung)
5. **Prüfen und senden:** Zusammenfassung, dann geht die Meldung an den Makler

Wenn die Verbindung abbricht, bleibt der Entwurf lokal erhalten und wird später gesendet.
Sobald die Meldung gesendet ist, werden die lokalen Daten gelöscht (siehe Datenschutz).

## Datenschutz mobil

- Der Offline-Cache (Service Worker) speichert **nur die App-Hülle** (Code, Schriften, Icons), keine Kunden- oder Fahrerdaten.
- Ein Schaden-Entwurf liegt nur verschlüsselt in IndexedDB und wird nach dem Senden oder nach 7 Tagen gelöscht.
- Standort, Kamera und Teilen werden nur auf eine Handlung des Nutzers hin angefragt, nie beim Start.
- Auf geteilten Geräten (Station) gibt es einen Knopf „Abmelden“. Die Sitzung endet automatisch nach Inaktivität.

## Motion mobil

- Tab-Wechsel: Überblenden in 150 ms, keine Seitwärtsbewegung.
- Bottom-Sheets: Einfahren von unten mit Feder-Kurve, maximal 250 ms.
- „Kopieren“: kurzes Häkchen und Toast „eVB kopiert“, dazu leichtes Vibrieren, wo das Gerät es unterstützt.
- Monatsbalken wachsen einmalig beim ersten Laden. Mit `prefers-reduced-motion` erscheinen sie sofort.

## Später als Flutter-App

- Die Design-Tokens (Farben, Radien, Abstände, Schrift) liegen in `packages/ui/tokens.json` und werden für Dart erzeugt.
- Das Kennzeichen kann direkt aus CoDriver übernommen werden (`LicensePlate`).
- Gleiche Tab-Struktur. Die PWA dient bis dahin als Referenz für die App.
