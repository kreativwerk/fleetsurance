# Kennzeichen-Komponente (wie CoDriver)

Quelle: CoDriver `flutter_app/kpi_admin/lib/widgets/license_plate.dart` (Branch `codriver-redesign-2026-05`, nur gelesen).
Fleetsurance baut die Komponente in React nach (`packages/ui` → `<LicensePlate />`), damit Fahrzeuge in beiden Apps gleich aussehen.
Später kann die Flutter-App von Fleetsurance das CoDriver-Widget direkt übernehmen.

## Aufbau

```
┌─┬───────────────────────────────┐   äußerer Rand  #14181D, Radius 5 px (compact) / 7 px (detail)
│★│  B   ◉   ML 3021              │   innerer Ring  #DFE3E8, 1 px, Abstand 1,5 / 2 px
│D│      ⊛                        │   EU-Band       #003399, 11 % der Breite
└─┴───────────────────────────────┘   12 Punkte     #F8D117 im Kreis, „D“ weiß, fett
```

- **Text:** fett, schmal (DIN Condensed → DIN Alternate → Arial Narrow → Helvetica Neue → Arial), Farbe `#14181D`.
- **Aufteilung:** Stadtkürzel · Siegel · Rest. Die Logik übernehmen wir 1:1 von CoDriver (`LicensePlateParts.of`):
  - Zuerst werden Leerzeichen und Bindestriche entfernt und alles großgeschrieben.
  - Dann werden die führenden Buchstaben abgetrennt. Davon bilden 1 bis 3 als Stadtkürzel den ersten Teil:
    5 oder mehr Buchstaben → 3, 4 Buchstaben → 2, sonst 1.
  - Beispiele: `ERHAL321` → `ERH` + `AL 321`, `BML3021` → `B` + `ML 3021`.

  ⚠️ Die Heuristik erkennt den echten Ort nicht. Bei `MAB123` (eigentlich Ort „MA“) liefert sie `M` + `AB 123`.
  Fleetsurance nutzt deshalb **die Trennung aus der Quelle**, wenn CoDriver oder Cortex sie liefert, und die Heuristik nur als Rückfall.
- **Siegel zwischen den Teilen, übereinander:**
  - HU-Plakette: hellblauer Kreis `#BCD6E9` mit Rand `#8AA8B9` (Kern `#5F7D8F` nur in der Größe *detail*)
  - Zulassungssiegel: grau `#CDD2D8`, gestrichelter Ring `#8A93A0`, rotes Mini-Wappen `#A83232`

## Größen

| Variante | Maß | Seitenverhältnis | Einsatz |
|---|---|---|---|
| `compact` | Höhe 34 px (mobil 40 px) | 520:110 | Tabellenzeilen, Listen, Fahrzeugkarten |
| `detail` | Breite 260 px | 520:130 | Fahrzeug-Detailseite, Schadenmeldung |

Alle Innenmaße skalieren proportional (Faktor = Höhe ÷ 34 bzw. ÷ 65).

## Regeln für Fleetsurance

- Das Kennzeichen ist **echte UI**, kein Bild. Gebaut wird es aus HTML und CSS, die Sterne und das Siegel als kleines Inline-SVG.
- Barrierefreiheit: `role="img"` mit `aria-label="Kennzeichen B ML 3021"`. Der Text bleibt markierbar und kopierbar.
- Die Schrift wird nicht mit der Systemeinstellung skaliert (wie `withNoTextScaling` in CoDriver). Die Komponente skaliert über ihre Größe.
- Neben dem Kennzeichen steht im Hauptbereich immer das Modell. Das Kennzeichen selbst bleibt der Schlüssel des Fahrzeugs.
- Den VIN-QR-Code (`VinQrTile` in CoDriver) übernimmt Fleetsurance **nicht**, auch nicht auf der mobilen Fahrzeugkarte (Entscheidung des Nutzers).
