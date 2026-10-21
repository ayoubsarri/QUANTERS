import type { Metadata } from "next";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  Outfit,
  Syne,
  Instrument_Serif,
  IBM_Plex_Sans_Arabic,
  JetBrains_Mono,
  Caveat,
} from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
  style: ["normal", "italic"],
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "QUANTERS — QUANTA Scientific Club",
  description:
    "Official Member Platform, Workshops & Activities, Skill Verification & Governance ERP for QUANTA Scientific Club · University of Algiers 1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} ${display.variable} ${jakarta.variable} ${serif.variable} ${arabic.variable} ${mono.variable} ${caveat.variable}`}
    >
      <body className="font-sans min-h-dvh flex flex-col bg-[#F4F7FB] text-[#09192F] selection:bg-[#FFE500] selection:text-[#09192F]">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
