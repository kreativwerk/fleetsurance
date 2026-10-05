"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { LicensePlate } from "@fleetsurance/ui";
import {
  halterartLabel,
  kennzeichenText,
  type Fahrzeug,
  type FahrzeugStatus,
} from "@fleetsurance/domain";
import { FahrzeugStatusPille, Pille } from "@/components/pillen";

type Filter = "alle" | FahrzeugStatus;
const filterLabel: Record<Filter, string> = { alle: "Alle", aktiv: "Aktiv", werkstatt: "Werkstatt", defleeted: "Defleeted" };

export function FlotteListe({ fahrzeuge }: { fahrzeuge: Fahrzeug[] }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const [suche, setSuche] = useState("");
  const begriff = useDeferredValue(suche.trim().toLowerCase());

  const anzahl = useMemo(() => {
    const z: Record<Filter, number> = { alle: fahrzeuge.length, aktiv: 0, werkstatt: 0, defleeted: 0 };
    fahrzeuge.forEach((f) => (z[f.status] += 1));
    return z;
  }, [fahrzeuge]);

  const sichtbar = useMemo(
    () =>
      fahrzeuge.filter((f) => {
        if (filter !== "alle" && f.status !== filter) return false;
        if (!begriff) return true;
        const heu = `${kennzeichenText(f.kennzeichen, f.kennzeichenOrt)} ${f.kennzeichen} ${f.hersteller} ${f.modell}`.toLowerCase();
        return heu.includes(begriff) || heu.replace(/\s/g, "").includes(begriff.replace(/\s/g, ""));
      }),
    [fahrzeuge, filter, begriff],
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative md:w-[320px]">
          <span className="sr-only">Fahrzeuge suchen</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Kennzeichen oder Modell"
            className="h-11 w-full rounded-full border border-hairline bg-surface pr-4 pl-11 text-[16px] placeholder:text-muted focus:border-blue focus:outline-none md:text-[14px]"
          />
        </label>
        <div role="group" aria-label="Nach Status filtern" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0">
          {(Object.keys(filterLabel) as Filter[]).map((f) => {
            const aktiv = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setFilter(f)}
                className={`pressable relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[14.5px] font-semibold ${
                  aktiv ? "text-on-blue" : "border border-hairline bg-surface text-ink hover:bg-fill-subtle"
                }`}
              >
                {aktiv && (
                  <motion.span
                    layoutId="flotte-filter"
                    className="absolute inset-0 rounded-full bg-blue"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{filterLabel[f]}</span>
                <span className={`tabular relative text-[13px] ${aktiv ? "text-on-blue" : "text-muted"}`}>{anzahl[f]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {sichtbar.length} Fahrzeuge angezeigt
      </p>

      {sichtbar.length === 0 ? (
        <div className="rounded-card border border-hairline bg-surface px-6 py-12 text-center">
          <p className="text-[17px] font-semibold">Kein Fahrzeug gefunden</p>
          <p className="mt-1 text-[15px] text-muted">Prüfe die Schreibweise des Kennzeichens oder setze den Filter auf „Alle“.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-card border border-hairline bg-surface md:block">
            <table className="w-full text-left text-[14.5px]">
              <thead>
                <tr className="border-b border-separator text-[13px] text-muted">
                  <th scope="col" className="py-3 pl-6 font-semibold">Kennzeichen</th>
                  <th scope="col" className="py-3 font-semibold">Fahrzeug</th>
                  <th scope="col" className="py-3 font-semibold">Halter</th>
                  <th scope="col" className="py-3 font-semibold">Standort</th>
                  <th scope="col" className="py-3 pr-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sichtbar.map((f) => (
                  <tr key={f.id} className="border-b border-hairline last:border-0">
                    <td className="py-3 pl-6">
                      <LicensePlate kennzeichen={f.kennzeichen} ort={f.kennzeichenOrt} groesse={30} />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold">
                        {f.hersteller} {f.modell}
                      </p>
                      <p className="text-[13px] text-muted">
                        {f.baujahr} · {f.antrieb}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-ink-2">{halterartLabel[f.halterart]}</td>
                    <td className="py-3 pr-4 text-ink-2">{f.standort}</td>
                    <td className="py-3 pr-6">
                      <FahrzeugStatusPille status={f.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2.5 md:hidden">
            {sichtbar.map((f) => (
              <li
                key={f.id}
                className="rounded-[16px] border border-hairline bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <LicensePlate kennzeichen={f.kennzeichen} ort={f.kennzeichenOrt} groesse={40} />
                  <FahrzeugStatusPille status={f.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <Pille farbe="blau">{halterartLabel[f.halterart]}</Pille>
                  <span className="text-[15px] text-ink-2">
                    {f.hersteller} {f.modell} · {f.baujahr} · {f.antrieb}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
