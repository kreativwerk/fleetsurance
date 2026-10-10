/** Sichtbarer Hinweis, solange kein Supabase-Projekt verbunden ist. */
export function DemoHinweis() {
  return (
    <p className="mb-4 rounded-[12px] bg-blue-tint px-4 py-2.5 text-[14px] text-ink-2">
      <span className="font-semibold text-blue">Demo-Modus:</span> Alle Daten sind erfunden. Ohne Verbindung zu Supabase wird nichts gespeichert.
    </p>
  );
}
