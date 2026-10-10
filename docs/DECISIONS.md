# Entscheidungsprotokoll

Ergebnis der Grill-Runden vom 2026-10-04. Bewertet wurde aus fünf Rollen (Council): Architekt, Datenschutz,
Makler, DSP-Unternehmer und Design. „Empf.“ zeigt, ob die Entscheidung der Empfehlung entspricht.

| # | Thema | Entscheidung | Empf. | Begründung / Risiko |
|---|---|---|---|---|
| D1 | Betreiber | Kreativwerk entwickelt und betreibt das System. Es ist ein SaaS für mehrere Makler. | ✅ | Kreativwerk ist Auftragsverarbeiter. Mit jedem Makler wird ein AVV geschlossen. |
| D2 | Branding | Co-Branding: Logo und Akzentfarbe pro Makler | ✅ | Die Farbe kommt aus Design-Tokens, Standard ist Blau. |
| D3 | Web-Technik | Next.js für das Web, Flutter für die native App (Phase 2) | ✅ | Das Dashboard ist datenlastig und muss WCAG AA erfüllen. Die Fahrer-App profitiert von Flutter. |
| D4 | Umfang V1 | Nur die Web-App, ohne Fahrer-Rolle | ✅ | CoDriver hat bereits eine Schadenserfassung für Fahrer. |
| D5 | Backend | Supabase in Frankfurt, getrennt von CoDriver | ✅ | CoDriver liegt in Firestore `nam5` (USA). Relationale Daten und RLS sprechen für Postgres. |
| D6 | Frontend-Hosting | Vercel in Frankfurt (fra1) | ✅ | Vercel ist ein US-Anbieter. Abgesichert über AVV und EU-Standardvertragsklauseln (SCC). |
| D7 | Datenzugriff Kreativwerk | Kein Zugriff. Zusätzlich Zugriffsregeln und Verschlüsselung sensibler Felder pro Mandant. | ✅ | Support nur mit zeitlich begrenzter Freigabe durch den Kunden und vollständigem Prüfprotokoll. |
| D8 | Login | Google oder E-Mail, ohne Pflicht-2FA | ⚠️ | **Risiko:** Ein gestohlenes Makler-Passwort öffnet alle Kunden dieses Maklers. Abmilderung: 2FA freiwillig, E-Mail-Warnung bei neuem Gerät, Sitzungen begrenzt. |
| D9 | Onboarding | Der Makler lädt das Unternehmen ein | ✅ | Die Zuordnung zum Makler ist dadurch eindeutig. |
| D10 | Datenquelle | Pro Flotte genau eine führende Quelle: CoDriver oder Cortex | ✅ | Abgleich über die FIN. Uploads zeigen vorher eine Vorschau der Änderungen. |
| D11 | CoDriver-Sync | Push mit Freigabe: signierte Webhooks plus nächtlicher Abgleich | ✅ | Fleetsurance bekommt keinen Vollzugriff auf die CoDriver-Datenbank. |
| D12 | CoDriver-Voraussetzung | Der Sync darf parallel zur EU-Migration und Absicherung von CoDriver starten | ⚠️ | **Risiko:** Daten kommen aus den USA, und der CoDriver-Speicher ist offen. Abmilderung: Fotos erst nach dem Fix übernehmen, nur die Mindestfelder. |
| D13 | Fahrerdaten | Nur das Minimum: Name, ID, Führerscheinklasse, Ablaufdatum, letzte Kontrolle | ✅ | Keine Leistungs- oder Verhaltensdaten (§ 87 BetrVG). |
| D14 | Versicherungsdaten | Der Makler lädt hoch, über einen Zuordnungs-Assistenten pro Versicherer | ✅ | Das Datenmodell ist BiPRO-nah, BiPRO kommt später. |
| D15 | Schadenablauf | Der Makler prüft und leitet als PDF oder E-Mail an den Versicherer weiter. Die Schadensnummer wird zurück eingetragen. | ✅ | Der Makler bleibt in der Kundenbeziehung. |
| D16 | eVB | Pro Kunde gibt es genau **zwei Dauer-eVB**: eine nur für Arval-Leasingfahrzeuge und eine für alle anderen Fahrzeuge. Der Makler pflegt beide. Der DSP kopiert oder teilt sie und meldet Neuzulassungen an den Makler. Es gibt keine eVB pro Fahrzeug. | ✅ | Fachliche Korrektur durch den Nutzer (2026-10-05). „eVB fehlt“ und die eVB-Spalte entfallen. |
| D17 | Gutachter | Der Makler lädt das Gutachten hoch | — | Kein externer Zugang. Einfacher und mit weniger Beteiligten. |
| D18 | Benachrichtigungen | In der App und per E-Mail ohne Inhalte, über einen EU-Mailanbieter | ✅ | |
| D19 | Sprache | Deutsch und Englisch in V1 | — | Mit i18n-Struktur ab dem ersten Tag. |
| D20 | Löschfristen | Standardwerte, pro Makler anpassbar, automatisch gelöscht | ✅ | Die Standardwerte stimmt ihr mit dem Datenschutzbeauftragten ab. |
| D21 | Abrechnung | Manuell per Rechnung, die App zählt die Fahrzeuge | ✅ | |
| D22 | Design | Fintech-freundlich wie Revolut oder Wise: Weiß, Blau als Akzent | — | Umsetzung mit impeccable im Modus *Operate*. Referenzen liegen in `docs/design-references/`. |
| D23 | Reihenfolge | M1 Kern → M2 Cortex → M3 Schaden, eVB, Dokumente → M4 Defleeting und Berichte → M5 CoDriver | ✅ | |
| D24 | Design-Überarbeitung | Reduzierter und minimalistischer als die ersten Entwürfe. Seitenmenü links schwarz. Die Schadensquote als 12 Monatsbalken statt als Plakette. Das Layout legt der Nutzer per Screenshot fest. | — | Bewusst nüchtern; die Hauptfläche bleibt weiß mit Blau als Akzent. |
| D25 | Kacheln | Keine schwarzen Kacheln. Karten sind weiß, Akzentfarbe Blau #245EED. Schwarz bleibt nur für das Seitenmenü. | — | Wunsch des Nutzers (2026-10-05). |
| D26 | Chat pro Schadensfall | Teilnehmer: DSP und Makler (Fahrer ab Phase 2). Inhalte: Text, Fotos und Dokumente (privat gespeichert, Fotos ohne EXIF), automatische Status-Zeilen. Makler können interne Notizen schreiben, die nur Makler sehen. Benachrichtigung in der App und per E-Mail ohne Inhalt. Lesebestätigung nur je Seite („Gelesen vom Makler“ bzw. „vom DSP“). Aufbewahrung wie die Schadenakte; Nachrichten können zurückgezogen, aber nicht gelöscht werden. Platzierung: Schadenakte mit Chat rechts, mobil als Tabs „Details“ und „Chat“. | ✅ | Interne Notizen werden per RLS getrennt (`sichtbarkeit = 'makler_intern'`). Sprachnachrichten und Gastzugänge sind bewusst nicht dabei. |
| D27 | Schrift und Apple-HIG | Schrift ist **Inter** (statt Montserrat), Gewichte 400/600/700. Das UI folgt den Apple HIG. Die Korrekturen H1 bis H13 stehen in `docs/design/apple-hig-review.md`, unter anderem: Tab-Leiste nur für Navigation, „Schaden melden“ als Knopf in der Navigationsleiste, iOS-Segmented-Control, keine Schatten auf Karten, Beschriftungen in der Icon-Leiste. | — | Wunsch des Nutzers (2026-10-05). |
| D28 | Supabase-Projekt | Eigenes Projekt „Fleetsurance“ in der Organisation „Kreativwerk Agentur“ (Pro), Region Frankfurt. Der Nutzer legt es im Dashboard an, weil das Anlegen über die Verbindung dreimal mit Zeitüberschreitung abbrach. Bis dahin wird gegen ein lokales Postgres entwickelt und getestet. | ✅ | Migrationen liegen in `supabase/migrations` und werden mit einem Befehl eingespielt. |
| D29 | Google-Login | Kommt später. V1 startet mit Anmeldung per E-Mail-Link. | — | Google braucht einen OAuth-Client in der Google Cloud von Kreativwerk. |
| D30 | E-Mail-Versand | Vorerst über den eingebauten Testversand von Supabase (geringes Limit, nur Entwicklung). Ein EU-Anbieter (z. B. Brevo) folgt vor dem ersten Kunden. | ⚠️ | **Risiko:** Der Testversand ist nicht für den Produktivbetrieb gedacht. |

## Offen, vor dem Start mit Kunden

- [ ] Repo `kreativwerk/fleetsurance` auf **privat** stellen.
- [ ] Mit dem Datenschutzbeauftragten: AVV-Vorlage für Makler, Datenschutz-Folgenabschätzung (DSFA), Standardwerte für Löschfristen, Liste der Unterauftragsverarbeiter (Supabase, Vercel, Mailanbieter, Google OAuth).
- [ ] Klären, wem die Marke „Fleetsurance“ gehört (Kreativwerk oder SUM).
- [ ] Anonymisierte Beispieldateien bereitstellen: Cortex-Export und Schadenliste eines Versicherers.
