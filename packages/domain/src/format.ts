const tz = "Europe/Berlin";

export function formatEuro(betrag: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(betrag);
}

export function formatDatum(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: tz }).format(
    new Date(iso),
  );
}

export function formatDatumKurz(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", timeZone: tz }).format(new Date(iso));
}

export function formatZeit(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
}

export function formatDatumZeit(iso: string): string {
  return `${formatDatum(iso)}, ${formatZeit(iso)}`;
}

export function formatGroesse(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toLocaleString("de-DE", { maximumFractionDigits: 1 })} MB` : `${kb} KB`;
}
