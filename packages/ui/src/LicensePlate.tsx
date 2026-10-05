import type { CSSProperties } from "react";
import { kennzeichenText, zerlegeKennzeichen } from "@fleetsurance/domain";

/*
 * Deutsches EU-Kennzeichen, 1:1 nach CoDriver `widgets/license_plate.dart`
 * (siehe docs/design/kennzeichen.md). Alle Maße skalieren mit --s.
 */
const ink = "#14181d";
const innerRing = "#dfe3e8";
const euBlue = "#003399";
const euYellow = "#f8d117";

type Props = {
  kennzeichen: string;
  /** Unterscheidungszeichen aus der Quelle, falls bekannt. */
  ort?: string;
  variante?: "compact" | "detail";
  /** compact: Höhe in px (Standard 34). detail: Breite in px (Standard 260). */
  groesse?: number;
  className?: string;
};

export function LicensePlate({ kennzeichen, ort, variante = "compact", groesse, className }: Props) {
  const detail = variante === "detail";
  const height = detail ? ((groesse ?? 260) * 130) / 520 : (groesse ?? 34);
  const width = detail ? (groesse ?? 260) : (height * 520) / 110;
  const s = detail ? height / 65 : height / 34;
  const teile = zerlegeKennzeichen(kennzeichen, ort);

  const px = (n: number) => `${n * s}px`;
  const text: CSSProperties = {
    fontFamily: "var(--fs-font-plate)",
    fontWeight: 600,
    fontSize: px(detail ? 46 : 24),
    letterSpacing: px(detail ? 0.5 : 0.5),
    lineHeight: 1,
    color: ink,
    whiteSpace: "nowrap",
  };

  return (
    <span
      role="img"
      aria-label={`Kennzeichen ${kennzeichenText(kennzeichen, ort)}`}
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        flex: "none",
        width,
        height,
        background: "#fff",
        border: `${px(detail ? 2 : 1.5)} solid ${ink}`,
        borderRadius: px(detail ? 7 : 5),
        overflow: "hidden",
        boxSizing: "border-box",
        verticalAlign: "middle",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: px(detail ? 2 : 1.5),
          border: `1px solid ${innerRing}`,
          borderRadius: px(Math.max(0, (detail ? 7 : 5) - (detail ? 4 : 3))),
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          width: width * 0.11,
          background: euBlue,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: px(detail ? 6 : 3),
          paddingBottom: px(detail ? 7 : 4.5),
          boxSizing: "border-box",
        }}
      >
        <EuSterne groesse={(detail ? 13 : 9) * s} />
        <span style={{ color: "#fff", fontWeight: 700, fontSize: px(detail ? 12 : 9), lineHeight: 1, fontFamily: "var(--fs-font)" }}>
          D
        </span>
      </span>
      <span
        aria-hidden
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: px(detail ? 10 : 6),
          padding: `0 ${px(detail ? 8 : 7)}`,
        }}
      >
        {teile.ort && <span style={text}>{teile.ort}</span>}
        <Siegel s={s} detail={detail} />
        {teile.rest && <span style={text}>{teile.rest}</span>}
      </span>
    </span>
  );
}

function EuSterne({ groesse }: { groesse: number }) {
  const punkte = Array.from({ length: 12 }, (_, i) => {
    const winkel = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    return { x: 50 + Math.cos(winkel) * 40, y: 50 + Math.sin(winkel) * 40 };
  });
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 100 100" aria-hidden>
      {punkte.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={8} fill={euYellow} />
      ))}
    </svg>
  );
}

function Siegel({ s, detail }: { s: number; detail: boolean }) {
  const hu = (detail ? 14 : 8) * s;
  const seal = (detail ? 16 : 9) * s;
  return (
    <span aria-hidden style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: (detail ? 2 : 1) * s }}>
      <svg width={hu} height={hu} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="9.25" fill="#bcd6e9" stroke="#8aa8b9" strokeWidth="1.5" />
        {detail && <circle cx="10" cy="10" r="3" fill="none" stroke="#5f7d8f" strokeWidth="1.2" />}
      </svg>
      <svg width={seal} height={seal} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10" fill="#cdd2d8" />
        <circle cx="10" cy="10" r="9" fill="none" stroke="#8a93a0" strokeWidth="1.4" strokeDasharray="3.1 2.55" />
        <path d="M7 6.5h6v4.2c0 2-1.4 3.3-3 3.8-1.6-.5-3-1.8-3-3.8z" fill="#a83232" />
      </svg>
    </span>
  );
}
