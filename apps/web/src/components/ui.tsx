import Link from "next/link";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Avatar, Logo } from "./shell";
export { FahrzeugStatusPille, Pille, SchadenStatusPille } from "./pillen";
import { ladeKontext } from "@/lib/daten";

export function Karte({
  children,
  className = "",
  as: Tag = "section",
  ...rest
}: { children: React.ReactNode; className?: string; as?: "section" | "div" | "article" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-card border border-hairline bg-surface ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function SchadenMeldenKnopf({ breit = false }: { breit?: boolean }) {
  return (
    <Link
      href="/schaeden/neu"
      className={`pressable inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue px-5 text-[15px] font-semibold text-white hover:bg-blue-press ${
        breit ? "h-[50px] w-full text-[17px]" : ""
      }`}
    >
      <Plus className="size-5" strokeWidth={2.25} aria-hidden />
      Schaden melden
    </Link>
  );
}

function FirmenPille({ name, station }: { name: string; station: string }) {
  return (
    <button
      type="button"
      className="pressable inline-flex h-11 min-w-0 items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-[14px] font-semibold text-ink hover:bg-fill-subtle"
      aria-label={`Unternehmen wechseln, aktuell ${name}`}
    >
      <span className="truncate">
        {name}
        {station && <span className="hidden text-muted lg:inline"> · Station {station}</span>}
      </span>
      <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
    </button>
  );
}

/**
 * Seitenkopf: Desktop mit Titel, Firmenwahl, Suche und Hauptaktion;
 * mobil als iOS-Navigationsleiste mit großem Titel und ＋ oben rechts (HIG H1).
 */
export async function Seitenkopf({
  titel,
  mobilTitel,
  untertitel,
  aktion = true,
}: {
  titel: string;
  mobilTitel?: string;
  untertitel?: string;
  aktion?: boolean;
}) {
  const kontext = await ladeKontext();
  const firma = kontext.unternehmen;
  return (
    <header className="mb-5 md:mb-7">
      <div className="flex items-center gap-3 md:hidden">
        <Logo klein />
        <div className="min-w-0 flex-1">
          {firma && <FirmenPille name={firma.name} station={firma.station} />}
        </div>
        {aktion && (
          <Link
            href="/schaeden/neu"
            aria-label="Schaden melden"
            className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-blue text-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </Link>
        )}
        <Avatar nutzer={kontext.nutzer} hell />
      </div>
      <div className="mt-4 flex items-center gap-4 md:mt-0">
        <div className="min-w-0">
          <h1 className="tracking-display text-[32px] leading-tight font-bold md:text-[30px]">
            <span className="md:hidden">{mobilTitel ?? titel}</span>
            <span className="hidden md:inline">{titel}</span>
          </h1>
          {untertitel && <p className="mt-0.5 text-[15px] text-muted">{untertitel}</p>}
        </div>
        <div className="ml-2 hidden md:block">
          {firma && <FirmenPille name={firma.name} station={firma.station} />}
        </div>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <label className="relative hidden xl:block">
            <span className="sr-only">Suchen</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Fahrzeug, Kennzeichen, Schaden …"
              className="h-11 w-[340px] rounded-full border border-hairline bg-surface pr-4 pl-10 text-[14px] placeholder:text-muted focus:border-blue focus:outline-none"
            />
          </label>
          {aktion && <SchadenMeldenKnopf />}
        </div>
      </div>
    </header>
  );
}

export function Abschnittstitel({ children, aktion }: { children: React.ReactNode; aktion?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="tracking-title text-[19px] font-semibold">{children}</h2>
      {aktion}
    </div>
  );
}
