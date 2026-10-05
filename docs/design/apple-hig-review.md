# Review nach Apple Human Interface Guidelines (HIG)

Stand 2026-10-05. Geprüft wurden die Entwürfe `final-desktop-weiss`, `schadenakte-chat-desktop`, `mobile-uebersicht-weiss` und `schadenakte-chat-mobile`.
Als Referenz dienten die Apple HIG (iOS und macOS) und `apple/DESIGN.md` aus awesome-design-md.

## Schrift: Inter

Die Schrift ist **Inter** (Wunsch des Nutzers, D27). Apple nennt Inter selbst als nächste offene Alternative zu SF Pro.

| Regel | Umsetzung |
|---|---|
| Gewichte 400 / 600 / 700, **kein 500** | Fließtext 400, Überschriften und Zahlen 600, große Titel 700 |
| Etwas engere Laufweite bei großen Größen | ab 20 px `letter-spacing: -0.01em`, ab 28 px `-0.02em` |
| Fließtext mobil 17 px (iOS „Body“) | Mobil 17 px mit Zeilenhöhe 1.44, Desktop 15 px mit 1.47 |
| Ziffern in Tabellen und Kennzahlen gleich breit | `font-variant-numeric: tabular-nums` |
| Schärferes „a“ wie bei SF | `font-feature-settings: "ss03", "cv11"` |
| Schriftgröße folgt der Systemeinstellung (Dynamic Type) | Größen in `rem`. Das Kennzeichen ist bewusst ausgenommen (siehe kennzeichen.md). |

## Befunde und Korrekturen

| # | Befund | HIG-Regel | Korrektur |
|---|---|---|---|
| H1 | Die mobile Tab-Leiste hat einen erhöhten runden „＋ Schaden melden“-Knopf. | Tab-Leisten dienen **nur der Navigation**, nicht Aktionen. Ein erhöhter Mittelknopf ist ein Android-Muster. | 4 Tabs: Übersicht · Flotte · Schäden · Mehr. „Schaden melden“ wird ein ＋-Knopf oben rechts in der Navigationsleiste und zusätzlich ein großer Knopf auf der Übersicht. |
| H2 | Die Tab-Leiste ist undurchsichtig weiß. | Leisten nutzen ein durchscheinendes Material mit Unschärfe. | `backdrop-filter: blur(20px)` auf 80 % Weiß, oben eine Trennlinie `rgba(0,0,0,.08)`. |
| H3 | „Details/Chat“ ist eine blau gefüllte Umschaltfläche. | Der iOS-Segmented-Control hat eine graue Spur und ein **weißes** ausgewähltes Segment. | Spur `#E9E9EB`, Auswahl weiß mit dezentem Schatten, Text 600. |
| H4 | Der Zurück-Knopf ist ein Pfeil im Kreis. | Zurück = Chevron plus Titel der vorherigen Seite. | „‹ Schäden“ in Blau, ohne Kreis. |
| H5 | Karten haben weiche Schatten. | Ebenen entstehen durch Flächenkontrast und Materialien, nicht durch Schatten auf Karten. | Karten weiß auf `#F5F5F7`, 1 px Rand `rgba(0,0,0,.06)`, kein Schatten. |
| H6 | Die Icon-Leiste am Desktop hat keine Beschriftungen. | Seitenleisten auf macOS und iPadOS sind beschriftet; reine Icons erschweren die Orientierung. | Kleine Beschriftung unter jedem Icon (11 px), Tooltip und Tastaturkürzel. Die Leiste bleibt schwarz. |
| H7 | „Teilen“ ist ein kleiner unterstrichener Link. | Bedienziele sind mindestens 44 × 44 pt groß. | Ein „Teilen“-Knopf mit Symbol in der eVB-Karte, Höhe 44 px. |
| H8 | Der Avatar ist ein Foto. | (Datenschutz und Ruhe) | Avatar mit Initialen. Fotos sind optional und nur auf eigenen Wunsch. |
| H9 | Radien sind gemischt. | Apple nutzt eine einheitliche Radien-Logik. | Karten 18 px, Eingabefelder und Buttons als Pille, kleine Elemente 8 px, Kennzeichen eigen. |
| H10 | Status-Pillen in Gelb (Text `#B0731C` auf `#FDF6EC`) haben nur einen Kontrast von 3,68:1. | WCAG AA und HIG-Lesbarkeit | Text dunkler (`#8A5A12`), damit der Kontrast mindestens 4,5:1 erreicht. |
| H11 | Es gibt keinen Dark Mode. | Apps unterstützen das Hell- und Dunkel-Schema des Systems. | Die Tokens werden von Anfang an für beide Schemata angelegt. Gebaut wird zuerst hell, dunkel folgt nach M1. |
| H12 | Die Chat-Blasen sind gut nah an iMessage. | (passt) | Eigene Blasen `#245EED`, fremde `#E9E9EB`, Zeitstempel zentriert in Grau, Eingabefeld als Pille. |
| H13 | Gedrückt-Zustände sind nicht definiert. | Jede Berührung gibt sofort Rückmeldung. | `transform: scale(.97)` für 120 ms bei Druck, bei reduzierter Bewegung nur eine Farbänderung. |

## Kontraste (geprüft)

| Paar | Kontrast | Ergebnis |
|---|---|---|
| Blau `#245EED` auf Weiß | 5,39 : 1 | ✅ AA |
| Blau `#245EED` auf `#F5F5F7` | 4,95 : 1 | ✅ AA |
| Grau `#6E6E73` auf Weiß | 5,07 : 1 | ✅ AA |
| Grau `#6E6E73` auf `#F5F5F7` | 4,66 : 1 | ✅ AA (knapp) |
| Text `#101828` auf `#F5F5F7` | 16,3 : 1 | ✅ AAA |
| Gelb `#B0731C` auf `#FDF6EC` | 3,68 : 1 | ❌ → korrigiert (H10) |

## Was bleibt (bewusste Abweichungen von Apple)

- **Akzentfarbe:** SUM-Blau `#245EED` statt Apple-Systemblau. Das ist die Marke.
- **Seitenmenü:** schwarz statt hell (Wunsch des Nutzers).
- **Status-Farben** (Grün, Gelb, Rot) zusätzlich zum Blau. Apple erlaubt Systemfarben für Zustände.
