"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { testdaten } from "@fleetsurance/domain";
import { hauptnavigation, istAktiv, tabs } from "./navigation";
import { initialen } from "@/lib/daten";

export function Logo({ klein = false }: { klein?: boolean }) {
  return (
    <svg width={klein ? 28 : 32} height={klein ? 28 : 32} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--fs-blue)" />
      <path d="M16 6.5 8.5 9.3v6.1c0 4.9 3.2 8.6 7.5 10.1 4.3-1.5 7.5-5.2 7.5-10.1V9.3z" fill="#fff" />
      <path d="m12.4 16 2.6 2.6 4.8-5.1" fill="none" stroke="var(--fs-blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Avatar({ hell = false }: { hell?: boolean }) {
  const { vorname, nachname } = testdaten.nutzer;
  return (
    <span
      className={`grid size-10 place-items-center rounded-full text-[13px] font-semibold ${
        hell ? "bg-fill text-ink-2" : "bg-white/12 text-white"
      }`}
      aria-label={`${vorname} ${nachname}`}
      role="img"
    >
      {initialen(vorname, nachname)}
    </span>
  );
}

/** Schwarze Icon-Leiste mit Beschriftung (HIG H6), ab Tablet sichtbar. */
export function Seitenleiste() {
  const pfad = usePathname();
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-y-0 left-0 z-30 hidden w-[92px] flex-col items-center bg-black py-5 md:flex"
    >
      <Link href="/uebersicht" className="mb-6 rounded-[10px]" aria-label="Fleetsurance Übersicht">
        <Logo />
      </Link>
      <ul className="flex flex-1 flex-col gap-1.5">
        {hauptnavigation.map(({ href, label, icon: Icon }) => {
          const aktiv = istAktiv(pfad, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktiv ? "page" : undefined}
                className={`pressable group relative flex w-[76px] flex-col items-center gap-1 rounded-md py-2 text-[11px] font-medium ${
                  aktiv ? "text-white" : "text-on-black-muted hover:text-white"
                }`}
              >
                <span className="relative grid size-10 place-items-center">
                  {aktiv && (
                    <motion.span
                      layoutId="nav-aktiv"
                      className="absolute inset-0 rounded-[12px] bg-blue"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className="relative size-[22px]" strokeWidth={1.75} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <Avatar />
    </nav>
  );
}

/** Untere Tab-Leiste mobil: 4 Tabs, durchscheinend mit Unschärfe (HIG H1, H2). */
export function TabLeiste() {
  const pfad = usePathname();
  const mehrAktiv = !tabs.slice(0, 3).some((t) => istAktiv(pfad, t.href));
  // Detailseiten (Schadenakte) zeigen wie iOS keine Tab-Leiste, damit der Chat das Eingabefeld behält.
  if (/^\/schaeden\/SF-/.test(pfad)) return null;
  return (
    <nav
      aria-label="Hauptnavigation"
      className="material-bar safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-separator md:hidden"
    >
      <ul className="grid h-[52px] grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const aktiv = href === "/mehr" ? mehrAktiv : istAktiv(pfad, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium ${
                  aktiv ? "text-blue" : "text-muted"
                }`}
              >
                <Icon className="size-6" strokeWidth={aktiv ? 2 : 1.6} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
