import {
  fahrzeugStatusLabel,
  schadenStatusLabel,
  type FahrzeugStatus,
  type SchadenStatus,
} from "@fleetsurance/domain";

/* Reine Anzeige-Bausteine ohne Datenzugriff: dürfen auch in Client-Komponenten. */
const ton = {
  blau: "bg-blue-tint text-blue",
  gelb: "bg-warn-tint text-warn",
  gruen: "bg-ok-tint text-ok",
  grau: "bg-neutral-tint text-neutral",
} as const;

export function Pille({ farbe, children }: { farbe: keyof typeof ton; children: React.ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12.5px] font-semibold whitespace-nowrap ${ton[farbe]}`}>
      {children}
    </span>
  );
}

const schadenFarbe: Record<SchadenStatus, keyof typeof ton> = {
  gemeldet: "blau",
  geprueft: "blau",
  beim_versicherer: "gelb",
  reguliert: "grau",
};

export function SchadenStatusPille({ status }: { status: SchadenStatus }) {
  return <Pille farbe={schadenFarbe[status]}>{schadenStatusLabel[status]}</Pille>;
}

const fahrzeugFarbe: Record<FahrzeugStatus, keyof typeof ton> = { aktiv: "gruen", werkstatt: "gelb", defleeted: "grau" };

export function FahrzeugStatusPille({ status }: { status: FahrzeugStatus }) {
  return <Pille farbe={fahrzeugFarbe[status]}>{fahrzeugStatusLabel[status]}</Pille>;
}
