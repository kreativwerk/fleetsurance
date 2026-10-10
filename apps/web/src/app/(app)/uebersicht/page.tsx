import Link from "next/link";
import { ArrowDown, ArrowUp, ShieldAlert, Truck } from "lucide-react";
import { veraenderungPunkte } from "@fleetsurance/domain";
import { Abschnittstitel, Karte, SchadenMeldenKnopf, Seitenkopf } from "@/components/ui";
import { QuoteDiagramm } from "@/components/quote-diagramm";
import { DauerEvbKarte, MaklerKarte } from "@/components/karten";
import { SchadenListe } from "@/components/schaden-liste";
import { istOffen, ladeDauerEvb, ladeFahrzeuge, ladeKontext, ladeQuoten, ladeSchaeden } from "@/lib/daten";

export const metadata = { title: "Übersicht" };

function gruss(): string {
  const stunde = Number(
    new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()),
  );
  return stunde < 11 ? "Guten Morgen" : stunde < 18 ? "Guten Tag" : "Guten Abend";
}

export default async function Uebersicht() {
  const [kontext, quoten, alleFahrzeuge, schaeden, evbs] = await Promise.all([
    ladeKontext(),
    ladeQuoten(),
    ladeFahrzeuge(),
    ladeSchaeden(),
    ladeDauerEvb(),
  ]);
  const { aktuell, vorjahr, ziel, jahr, monate } = quoten;
  const delta = aktuell !== null && vorjahr !== null ? veraenderungPunkte(aktuell, vorjahr) : null;
  const besser = delta !== null && delta <= 0;
  const fahrzeuge = alleFahrzeuge.filter((f) => f.status !== "defleeted");
  const offen = schaeden.filter(istOffen);

  return (
    <>
      <Seitenkopf titel="Übersicht" mobilTitel={`${gruss()}, ${kontext.nutzer.vorname}`} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:gap-5">
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
            <Karte className="col-span-2 p-5 md:col-span-1">
              <h2 className="text-[15px] font-semibold">Schadensquote {jahr}</h2>
              <p className="tabular tracking-display mt-1 text-[44px] leading-none font-bold md:text-[40px]">
                {aktuell === null ? "–" : `${aktuell} %`}
              </p>
              {delta === null ? (
                <p className="mt-2 text-[14px] text-muted">Noch keine Vergleichsdaten vom Makler</p>
              ) : (
                <p className={`mt-2 inline-flex items-center gap-1 text-[14px] font-semibold ${besser ? "text-ok" : "text-error"}`}>
                  {besser ? <ArrowDown className="size-4" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
                  <span className="sr-only">{besser ? "Gesunken um" : "Gestiegen um"}</span>
                  {Math.abs(delta)} Pkt. <span className="font-normal text-muted">ggü. Vorjahr</span>
                </p>
              )}
              <div className="mt-4 md:hidden">
                <QuoteDiagramm quoten={monate} ziel={ziel} kompakt />
              </div>
            </Karte>

            <div className="col-span-2 md:hidden">
              <SchadenMeldenKnopf breit />
            </div>

            <Kennzahl
              titel="Fahrzeuge"
              wert={fahrzeuge.length}
              hinweis={`im Bestand · ${alleFahrzeuge.length - fahrzeuge.length} defleeted`}
              icon={<Truck className="size-6" strokeWidth={1.6} aria-hidden />}
              href="/flotte"
            />
            <Kennzahl
              titel="Offene Schäden"
              wert={offen.length}
              hinweis="noch nicht reguliert"
              icon={<ShieldAlert className="size-6" strokeWidth={1.6} aria-hidden />}
              href="/schaeden"
            />
          </div>

          <Karte className="hidden p-6 md:block">
            <Abschnittstitel>Schadensquote nach Monat</Abschnittstitel>
            <div className="pt-4">
              <QuoteDiagramm quoten={monate} ziel={ziel} />
            </div>
          </Karte>

          {evbs.length > 0 && (
            <div className="lg:hidden">
              <DauerEvbKarte evbs={evbs} />
            </div>
          )}

          <section className="pt-2 md:rounded-card md:border md:border-hairline md:bg-surface md:p-6 md:pt-6">
            <Abschnittstitel aktion={<AlleLink />}>Letzte Schäden</Abschnittstitel>
            {schaeden.length === 0 ? (
              <p className="py-6 text-center text-[15px] text-muted">Noch keine Schäden gemeldet.</p>
            ) : (
              <SchadenListe schaeden={schaeden.slice(0, 5)} />
            )}
          </section>

          {kontext.makler && (
            <div className="lg:hidden">
              <MaklerKarte makler={kontext.makler} />
            </div>
          )}
        </div>

        <aside className="hidden space-y-5 lg:block" aria-label="Dauer-eVB und Makler">
          {evbs.length > 0 && <DauerEvbKarte evbs={evbs} />}
          {kontext.makler && <MaklerKarte makler={kontext.makler} />}
        </aside>
      </div>
    </>
  );
}

function AlleLink() {
  return (
    <Link href="/schaeden" className="text-[15px] font-semibold text-blue hover:underline">
      Alle anzeigen
    </Link>
  );
}

function Kennzahl({
  titel,
  wert,
  hinweis,
  icon,
  href,
}: {
  titel: string;
  wert: number;
  hinweis: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="pressable rounded-card border border-hairline bg-surface p-4 hover:border-separator md:p-5">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-[15px] font-semibold">{titel}</h2>
        <span className="text-muted">{icon}</span>
      </div>
      <p className="tabular tracking-display mt-2 text-[34px] leading-none font-bold md:text-[40px]">{wert}</p>
      <p className="mt-2 text-[13px] text-muted">{hinweis}</p>
    </Link>
  );
}
