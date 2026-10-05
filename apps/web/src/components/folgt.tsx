import Link from "next/link";
import { Seitenkopf } from "./ui";

/** Ehrlicher Platzhalter für Bereiche späterer Meilensteine. */
export function Folgt({ titel, meilenstein, text }: { titel: string; meilenstein: string; text: string }) {
  return (
    <>
      <Seitenkopf titel={titel} aktion={false} />
      <section className="max-w-[640px] rounded-card border border-hairline bg-surface p-6 md:p-8">
        <p className="text-[14px] font-semibold text-blue">{meilenstein}</p>
        <h2 className="tracking-title mt-1 text-[21px] font-semibold">Dieser Bereich wird gerade gebaut</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{text}</p>
        <Link
          href="/uebersicht"
          className="pressable mt-6 inline-flex h-11 items-center rounded-full bg-fill-subtle px-5 text-[15px] font-semibold text-ink hover:bg-fill"
        >
          Zur Übersicht
        </Link>
      </section>
    </>
  );
}
