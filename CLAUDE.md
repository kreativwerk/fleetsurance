# FLEETSURANCE – Arbeitsregeln für Claude

Fleetsurance ist eine Plattform für Flottenversicherungs-Management: Dashboards für
Unternehmen (z. B. Amazon DSPs) und für Versicherungsmakler, die Daten wie Schadensquoten
einspielen. Fahrzeuge und Fahrer werden aus CoDriver synchronisiert (nur lesend).

## Pflicht-Skills – bei JEDER Bearbeitung beachten

| Phase | Skill | Wann |
|---|---|---|
| Planung / Entscheidungen | `grill-me` → `grilling` | Jede neue Funktion, jede Architektur-Entscheidung: in Runden fragen, Empfehlung pro Frage, erst bauen nach bestätigtem gemeinsamen Verständnis. |
| Mehrperspektiven-Review | council (siehe unten) | Größere Entscheidungen aus Sicht Architekt, Datenschutz, Makler, DSP-Unternehmer, Design bewerten. |
| Produkt/Eng/Design-Review | gstack (`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/review`, `/cso`, `/qa`) | Vor dem Bauen: Plan-Reviews. Vor jedem Push: `/review`; bei Sicherheits-/Datenschutzthemen: `/cso`. |
| Design / UI | `impeccable` | **Immer** bei jeder UI-Arbeit. Dashboards = Modus *Operate*. Vor jeder UI-Änderung `reference/craft-floor.md` lesen. |
| Motion | `impeccable animate` | Stilvolle, zweckvolle Animationen; immer mit `prefers-reduced-motion`-Pfad. |
| Design-Inspiration | `docs/design-references/` (awesome-design-md) | Stripe, Linear, Revolut, Wise, Supabase als Referenz für klare Fintech-/SaaS-Sprache. |

Hinweise:
- **gstack** ist nicht ins Repo kopiert (81 MB, eigene Binaries). Installation pro Maschine:
  `git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup --team`.
  Fehlt gstack, wird nach seiner Methode gearbeitet (CEO-/Eng-/Design-Review als Checkliste).
- **council**: Skill-Quelle noch offen. Bis dahin: jede größere Entscheidung explizit aus den
  fünf Rollen oben bewerten und die Abwägung dokumentieren.

## Design-Leitplanken

- Modern, übersichtlich, viel Weißraum. **Weiß als Basis, Blau als Akzentfarbe** (angelehnt an sum-makler.de).
- Farben und Abstände ausschließlich über Design-Tokens (später in `DESIGN.md`).
- Motion: schnell und funktional im Dashboard (Feedback, Zustandswechsel, Kontinuität);
  höchstens ein bewusst gestalteter Moment pro Fläche. Kein Warten auf Lade-Choreografien.
- Barrierefreiheit: WCAG 2.2 AA, Tastaturbedienung, Kontraste.

## Datenschutz – nicht verhandelbar

- Hosting und Datenverarbeitung ausschließlich in der EU; AVV mit allen Dienstleistern.
- Datenminimierung: aus CoDriver nur Felder übernehmen, die fachlich gebraucht werden.
- Strikte Mandantentrennung per Row Level Security; Makler sehen fahrerbezogene Details nur fallbezogen.
- Fahrerbezogene Auswertungen (Schadensquote pro Fahrer, GPS) = mögliche Leistungs-/Verhaltenskontrolle
  (§ 87 BetrVG, DSFA prüfen). Standard: Auswertungen auf Fahrzeug-/Flottenebene, pseudonymisiert.
- Sensible Felder (Führerschein, Ausweis) zusätzlich verschlüsselt; Audit-Log für jeden Zugriff; Löschfristen.
- Keine echten personenbezogenen Daten in Tests, Seeds, Logs, Screenshots oder Commits.
- CoDriver-Repo: **nur lesen**, niemals schreiben oder pushen.
