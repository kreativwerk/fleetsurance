"use client";

import Link from "next/link";
import { Car, ChevronRight, Copy, FileText, Mail, Phone, Share } from "lucide-react";
import type { DauerEvb, Makler } from "@fleetsurance/domain";
import { useToast } from "./toast";

const evbLabel: Record<DauerEvb["art"], string> = {
  arval: "Arval-Leasing",
  allgemein: "Alle anderen Fahrzeuge",
};

async function kopiere(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Zwei Dauer-eVB pro Kunde (D16): Arval-Leasing und alle anderen Fahrzeuge. */
export function DauerEvbKarte({ evbs }: { evbs: DauerEvb[] }) {
  const { zeige } = useToast();

  async function teilen() {
    const text = evbs.map((e) => `${evbLabel[e.art]}: eVB ${e.nummer}`).join("\n");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Dauer-eVB", text });
        return;
      } catch (fehler) {
        // Abgebrochen: nichts tun. Sonst (z. B. NotAllowedError) unten auf Kopieren ausweichen.
        if (fehler instanceof DOMException && fehler.name === "AbortError") return;
      }
    }
    if (await kopiere(text)) zeige("Beide eVB kopiert");
  }

  return (
    <section aria-labelledby="evb-titel" className="rounded-card bg-blue p-5 text-on-blue md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-[12px] bg-blue-deep">
          <FileText className="size-5" aria-hidden />
        </span>
        <h2 id="evb-titel" className="tracking-title text-[21px] font-semibold">
          Dauer-eVB
        </h2>
      </div>
      <ul className="space-y-2.5">
        {evbs.map((evb) => (
          <li key={evb.art} className="flex items-center gap-3 rounded-[14px] bg-surface px-4 py-3 text-ink">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-muted">{evbLabel[evb.art]}</p>
              <p className="tabular text-[17px] font-semibold tracking-wide">eVB {evb.nummer}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (await kopiere(evb.nummer)) zeige(`eVB ${evb.nummer} kopiert`);
              }}
              className="pressable inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-blue hover:bg-blue-tint"
              aria-label={`eVB ${evb.nummer} für ${evbLabel[evb.art]} kopieren`}
            >
              <Copy className="size-4" aria-hidden />
              Kopieren
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_auto] md:grid-cols-1 2xl:grid-cols-[1fr_auto]">
        <Link
          href="/zulassung"
          className="pressable inline-flex h-11 items-center justify-center gap-2 rounded-full bg-surface px-4 text-[15px] font-semibold text-blue hover:bg-blue-tint"
        >
          <Car className="size-[18px]" aria-hidden />
          Fahrzeug zur Zulassung melden
        </Link>
        <button
          type="button"
          onClick={teilen}
          className="pressable inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-deep px-5 text-[15px] font-semibold text-on-blue hover:bg-blue-deeper"
        >
          <Share className="size-[18px]" aria-hidden />
          Teilen
        </button>
      </div>
    </section>
  );
}

export function MaklerKarte({ makler }: { makler: Makler }) {
  const { name, telefon, email } = makler;
  return (
    <section aria-labelledby="makler-titel" className="rounded-card border border-hairline bg-surface p-5 md:p-6">
      <p id="makler-titel" className="text-[14px] font-semibold text-muted">
        Dein Makler
      </p>
      <p className="tracking-title mt-1 text-[21px] leading-snug font-semibold">{name}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <a
          href={`tel:${telefon.replace(/\s/g, "")}`}
          className="pressable inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fill-subtle text-[15px] font-semibold text-ink hover:bg-fill"
        >
          <Phone className="size-[18px]" aria-hidden />
          Anrufen
        </a>
        <a
          href={`mailto:${email}`}
          className="pressable inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fill-subtle text-[15px] font-semibold text-ink hover:bg-fill"
        >
          <Mail className="size-[18px]" aria-hidden />
          Nachricht
        </a>
      </div>
    </section>
  );
}

export function ZeilenPfeil() {
  return <ChevronRight className="size-5 shrink-0 text-muted/70" aria-hidden />;
}
