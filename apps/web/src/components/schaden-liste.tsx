import Link from "next/link";
import { LicensePlate } from "@fleetsurance/ui";
import { formatDatum, type Schaden } from "@fleetsurance/domain";
import { fahrzeugZu } from "@/lib/daten";
import { SchadenStatusPille } from "./ui";
import { ZeilenPfeil } from "./karten";

/** Schäden als Tabelle (ab Tablet) bzw. als Liste (mobil). */
export function SchadenListe({ schaeden }: { schaeden: Schaden[] }) {
  return (
    <>
      <table className="hidden w-full text-left text-[14.5px] md:table">
        <thead>
          <tr className="border-b border-separator text-[13px] text-muted">
            <th scope="col" className="pb-2.5 font-medium">Datum</th>
            <th scope="col" className="pb-2.5 font-medium">Kennzeichen</th>
            <th scope="col" className="pb-2.5 font-medium">Schadenart</th>
            <th scope="col" className="pb-2.5 font-medium">Status</th>
            <th scope="col" className="w-8 pb-2.5"><span className="sr-only">Öffnen</span></th>
          </tr>
        </thead>
        <tbody>
          {schaeden.map((s) => {
            const f = fahrzeugZu(s);
            return (
              <tr key={s.id} className="group relative border-b border-hairline last:border-0 hover:bg-fill-subtle/60">
                <td className="tabular py-3 pr-4 whitespace-nowrap text-ink-2">{formatDatum(s.am)}</td>
                <td className="py-3 pr-4">
                  <LicensePlate kennzeichen={f.kennzeichen} ort={f.kennzeichenOrt} groesse={28} />
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/schaeden/${s.id}`} className="font-medium text-ink after:absolute after:inset-0 focus-visible:outline-none">
                    {s.art}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <SchadenStatusPille status={s.status} />
                </td>
                <td className="py-3">
                  <ZeilenPfeil />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="space-y-2.5 md:hidden">
        {schaeden.map((s) => {
          const f = fahrzeugZu(s);
          return (
            <li key={s.id}>
              <Link
                href={`/schaeden/${s.id}`}
                className="pressable block rounded-[16px] border border-hairline bg-surface p-3.5"
              >
                <span className="flex items-center justify-between gap-3">
                  <LicensePlate kennzeichen={f.kennzeichen} ort={f.kennzeichenOrt} groesse={30} />
                  <SchadenStatusPille status={s.status} />
                </span>
                <span className="mt-2.5 flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[16px] font-semibold">{s.art}</span>
                  <span className="tabular shrink-0 text-[13px] text-muted">{formatDatum(s.am)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
