"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, ChevronLeft, FileText, ImageIcon } from "lucide-react";
import { LicensePlate } from "@fleetsurance/ui";
import {
  formatDatum,
  formatDatumZeit,
  formatEuro,
  formatGroesse,
  halterartLabel,
  schadenStatusLabel,
  schadenStatusReihenfolge,
  schuldfrageLabel,
  type Fahrzeug,
  type Lesestatus,
  type Nachricht,
  type Schaden,
  type Seite,
} from "@fleetsurance/domain";
import { SchadenStatusPille } from "@/components/pillen";
import { SchadenChat } from "./chat";

type Ansicht = "details" | "chat";
const ansichten: Ansicht[] = ["details", "chat"];

const mobilAbfrage = "(max-width: 767px)";
function useIstMobil(): boolean {
  return useSyncExternalStore(
    (melden) => {
      const mq = window.matchMedia(mobilAbfrage);
      mq.addEventListener("change", melden);
      return () => mq.removeEventListener("change", melden);
    },
    () => window.matchMedia(mobilAbfrage).matches,
    () => false,
  );
}

export function SchadenAkte(props: {
  schaden: Schaden;
  fahrzeug: Fahrzeug;
  nachrichten: Nachricht[];
  lesestatus: Lesestatus[];
  seite: Seite;
  autor: string;
}) {
  const { schaden, fahrzeug } = props;
  const [ansicht, setAnsicht] = useState<Ansicht>("details");
  const mobil = useIstMobil();
  // Ab Tablet stehen beide Bereiche nebeneinander: dann keine Tab-Semantik.
  const panelProps = (a: Ansicht) =>
    mobil ? { id: `panel-${a}`, role: "tabpanel", "aria-labelledby": `tab-${a}`, tabIndex: 0 } : { id: `panel-${a}` };

  return (
    <>
      {/* Mobil: iOS-Navigationsleiste (HIG H4) */}
      <div className="-mx-4 mb-3 grid grid-cols-[1fr_auto_1fr] items-center px-2 md:hidden">
        <Link href="/schaeden" className="inline-flex h-11 items-center text-[17px] text-blue">
          <ChevronLeft className="size-7" strokeWidth={2} aria-hidden />
          Schäden
        </Link>
        <p className="tabular text-[17px] font-semibold">{schaden.id}</p>
        <span />
      </div>

      <nav aria-label="Brotkrumen" className="mb-2 hidden text-[14px] text-muted md:block">
        <Link href="/schaeden" className="text-blue hover:underline">
          Schäden
        </Link>
        <span className="mx-2">/</span>
        <span className="tabular">{schaden.id}</span>
      </nav>

      <header className="mb-4 md:mb-6">
        <div className="mb-3 md:hidden">
          <LicensePlate kennzeichen={fahrzeug.kennzeichen} ort={fahrzeug.kennzeichenOrt} groesse={40} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="tracking-display text-[26px] leading-tight font-bold md:text-[30px]">{schaden.art}</h1>
          <SchadenStatusPille status={schaden.status} />
        </div>
      </header>

      {/* iOS-Segmented-Control (HIG H3), Tastatur nach APG-Tabs-Muster. Nur mobil ein Tab-Widget. */}
      <div
        role="tablist"
        aria-label="Ansicht"
        className="mb-4 grid grid-cols-2 rounded-[10px] bg-fill p-[3px] md:hidden"
        onKeyDown={(e) => {
          const ziel =
            e.key === "ArrowRight" || e.key === "End" ? "chat" : e.key === "ArrowLeft" || e.key === "Home" ? "details" : null;
          if (!ziel) return;
          e.preventDefault();
          setAnsicht(ziel);
          document.getElementById(`tab-${ziel}`)?.focus();
        }}
      >
        {ansichten.map((a) => (
          <button
            key={a}
            id={`tab-${a}`}
            role="tab"
            type="button"
            aria-selected={ansicht === a}
            aria-controls={`panel-${a}`}
            tabIndex={ansicht === a ? 0 : -1}
            onClick={() => setAnsicht(a)}
            className={`relative h-[38px] rounded-[8px] text-[15px] font-semibold ${ansicht === a ? "text-ink" : "text-ink-2"}`}
          >
            {ansicht === a && (
              <motion.span
                layoutId="segment"
                className="absolute inset-0 rounded-[8px] bg-surface shadow-[var(--fs-shadow-segment)]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{a === "details" ? "Details" : "Chat"}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div
          {...panelProps("details")}
          className={`${ansicht === "details" ? "block" : "hidden"} min-w-0 md:block`}
        >
          <Details schaden={schaden} fahrzeug={fahrzeug} />
        </div>
        <div
          {...panelProps("chat")}
          className={`${ansicht === "chat" ? "flex" : "hidden"} h-[calc(100dvh-290px)] min-h-[380px] flex-col overflow-hidden md:sticky md:top-6 md:flex md:h-[calc(100dvh-150px)] md:rounded-card md:border md:border-hairline md:bg-surface`}
        >
          <SchadenChat
            schadenId={schaden.id}
            start={props.nachrichten}
            lesestatus={props.lesestatus}
            seite={props.seite}
            autor={props.autor}
          />
        </div>
      </div>
    </>
  );
}

function Details({ schaden, fahrzeug }: { schaden: Schaden; fahrzeug: Fahrzeug }) {
  const felder: [string, string][] = [
    ["Schadenzeitpunkt", formatDatumZeit(schaden.am)],
    ["Ort", schaden.ort],
    ["Geschätzter Aufwand", formatEuro(schaden.aufwandGeschaetztEuro)],
    ["Schuldfrage", schuldfrageLabel[schaden.schuldfrage]],
    ["Polizei", schaden.polizei ? "Ja" : "Nein"],
    ["Schadensnummer Versicherer", schaden.schadensnummerVersicherer ?? "Noch nicht vergeben"],
  ];
  const erreicht = new Map(schaden.statusVerlauf.map((s) => [s.status, s.am]));
  const aktuellIndex = schadenStatusReihenfolge.indexOf(schaden.status);

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="rounded-card border border-hairline bg-surface p-5 md:p-6">
        <div className="hidden items-center gap-5 md:flex">
          <LicensePlate kennzeichen={fahrzeug.kennzeichen} ort={fahrzeug.kennzeichenOrt} variante="detail" groesse={240} />
          <div>
            <p className="text-[17px] font-semibold">
              {fahrzeug.hersteller} {fahrzeug.modell}
            </p>
            <p className="text-[14px] text-muted">{halterartLabel[fahrzeug.halterart]}</p>
          </div>
        </div>
        <p className="text-[15px] text-ink-2 md:hidden">
          {fahrzeug.hersteller} {fahrzeug.modell} · {halterartLabel[fahrzeug.halterart]}
        </p>
        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          {felder.map(([titel, wert]) => (
            <div key={titel}>
              <dt className="text-[13px] text-muted">{titel}</dt>
              <dd className="tabular mt-0.5 text-[16px] font-semibold">{wert}</dd>
            </div>
          ))}
        </dl>

        <ol className="mt-7 grid grid-cols-4 border-t border-hairline pt-6" aria-label="Statusverlauf">
          {schadenStatusReihenfolge.map((status, i) => {
            const am = erreicht.get(status);
            const fertig = i < aktuellIndex || (i === aktuellIndex && status === "reguliert");
            const aktuell = i === aktuellIndex && !fertig;
            return (
              <li key={status} className="relative flex flex-col items-center text-center" aria-current={aktuell ? "step" : undefined}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className={`absolute top-[13px] right-1/2 h-[2px] w-full ${i <= aktuellIndex ? "bg-blue" : "bg-fill"}`}
                  />
                )}
                <span
                  className={`relative grid size-7 place-items-center rounded-full ${
                    fertig ? "bg-blue text-white" : aktuell ? "border-[2px] border-blue bg-surface" : "border-[2px] border-fill bg-surface"
                  }`}
                >
                  {fertig && <Check className="size-4" strokeWidth={3} aria-hidden />}
                  {aktuell && <span className="size-3 rounded-full bg-blue" />}
                </span>
                <span className={`mt-2 text-[13px] font-semibold md:text-[14px] ${aktuell ? "text-blue" : i <= aktuellIndex ? "text-ink" : "text-muted"}`}>
                  {schadenStatusLabel[status]}
                </span>
                <span className="tabular text-[12px] text-muted">{am ? formatDatum(am) : "–"}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 md:gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-card border border-hairline bg-surface p-5">
          <h2 className="mb-3 text-[16px] font-semibold">Fotos ({schaden.fotos})</h2>
          <ul className="grid grid-cols-4 gap-2">
            {Array.from({ length: schaden.fotos }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="pressable grid aspect-square w-full place-items-center rounded-[12px] bg-fill-subtle text-muted hover:bg-fill"
                  aria-label={`Foto ${i + 1} öffnen`}
                >
                  <ImageIcon className="size-6" strokeWidth={1.5} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12.5px] text-muted">Vorschau in M0 ohne Bilddaten.</p>
        </section>
        <section className="rounded-card border border-hairline bg-surface p-5">
          <h2 className="mb-3 text-[16px] font-semibold">Dokumente ({schaden.dokumente.length})</h2>
          {schaden.dokumente.length === 0 ? (
            <p className="text-[15px] text-muted">Noch keine Dokumente. Lade sie im Chat hoch.</p>
          ) : (
            <ul className="space-y-2">
              {schaden.dokumente.map((d) => (
                <li key={d.name} className="flex items-center gap-3 rounded-[12px] bg-fill-subtle px-3 py-2.5">
                  <FileText className="size-5 shrink-0 text-error" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{d.name}</span>
                    <span className="block text-[12.5px] text-muted">{formatGroesse(d.groesseKb)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
