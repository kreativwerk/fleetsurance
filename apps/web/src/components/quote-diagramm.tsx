"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { aktuellerMonat, monatKurz, type Monatsquote } from "@fleetsurance/domain";

/*
 * Schadensquote je Monat: eine Reihe, daher keine Legende (Titel benennt sie).
 * Vergangene Monate #6A8CF0 (3,2:1 auf Weiß), aktueller Monat Markenblau.
 * Werte: aktueller Monat als Label, übrige per Hover/Fokus und in der Tabellenansicht.
 */
const VERGANGEN = "#6a8cf0";
const MAX = 100;

export function QuoteDiagramm({
  quoten,
  ziel,
  kompakt = false,
}: {
  quoten: Monatsquote[];
  ziel: number;
  kompakt?: boolean;
}) {
  const reduziert = useReducedMotion();
  const aktuell = aktuellerMonat(quoten);
  const [fokus, setFokus] = useState<number | null>(null);
  const hoehe = kompakt ? 112 : 168;

  return (
    <figure className="m-0">
      <div className="relative flex" style={{ height: hoehe + 28 }}>
        {!kompakt && (
          <div className="tabular flex w-11 shrink-0 flex-col justify-between pb-7 text-[12px] text-muted" aria-hidden>
            {[100, 75, 50, 25, 0].map((w) => (
              <span key={w} className="leading-none">
                {w} %
              </span>
            ))}
          </div>
        )}
        <div className="relative flex-1">
          {/* Zielquote als gestrichelte Referenzlinie */}
          <div
            aria-hidden
            className="absolute inset-x-0 border-t border-dashed border-muted/50"
            style={{ bottom: 28 + (ziel / MAX) * hoehe }}
          >
            <span className={`absolute -top-5 text-[12px] text-muted ${kompakt ? "left-0" : "right-0"}`}>Zielquote {ziel} %</span>
          </div>
          <ol className="absolute inset-x-0 top-0 bottom-0 flex items-end gap-[2px]" aria-hidden>
            {quoten.map((m, i) => {
              const istAktuell = m.monat === aktuell?.monat;
              const zeigeWert = m.quote !== null && (istAktuell || fokus === m.monat);
              return (
                <li
                  key={m.monat}
                  className="relative flex h-full flex-1 flex-col items-center justify-end"
                  onPointerEnter={() => setFokus(m.monat)}
                  onPointerLeave={() => setFokus(null)}
                >
                  <div className="relative flex w-full justify-center" style={{ height: hoehe }}>
                    {m.quote !== null ? (
                      <motion.div
                        className="absolute bottom-0 rounded-t-[4px]"
                        style={{
                          width: kompakt ? "62%" : "56%",
                          maxWidth: 44,
                          height: (m.quote / MAX) * hoehe,
                          background: istAktuell ? "var(--fs-blue)" : VERGANGEN,
                          transformOrigin: "bottom",
                          opacity: fokus !== null && fokus !== m.monat ? 0.55 : 1,
                        }}
                        initial={reduziert ? false : { scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.6, delay: reduziert ? 0 : 0.03 * i, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : (
                      <div className="absolute bottom-0 h-[3px] w-[40%] max-w-6 rounded-full bg-fill" />
                    )}
                    {zeigeWert && (
                      <span
                        className={`tabular absolute -translate-y-full rounded-full px-2 py-0.5 whitespace-nowrap text-[12.5px] font-semibold ${
                          istAktuell ? "bg-blue text-white" : "bg-ink text-white"
                        }`}
                        style={{ bottom: ((m.quote ?? 0) / MAX) * hoehe + 6 }}
                      >
                        {m.quote} %
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 h-5 text-[12px] ${istAktuell ? "font-semibold text-ink" : "text-muted"}`}
                  >
                    {monatKurz[m.monat - 1]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <table className="sr-only">
        <caption>Schadensquote je Monat</caption>
        <thead>
          <tr>
            <th scope="col">Monat</th>
            <th scope="col">Quote</th>
          </tr>
        </thead>
        <tbody>
          {quoten.map((m) => (
            <tr key={m.monat}>
              <th scope="row">{monatKurz[m.monat - 1]}</th>
              <td>{m.quote === null ? "noch keine Daten" : `${m.quote} %`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
