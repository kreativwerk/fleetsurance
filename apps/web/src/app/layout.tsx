import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/barlow-condensed/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fleetsurance", template: "%s · Fleetsurance" },
  description: "Flottenversicherung im Blick: Fahrzeuge, Schäden, Schadensquote und Dauer-eVB.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
