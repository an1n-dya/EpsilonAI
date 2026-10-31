import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { LiquidBackdrop } from "@/components/backdrop/liquid-backdrop";
import { LightField } from "@/components/glass/light-field";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Epsilon — answers with a margin of error",
    template: "%s · Epsilon",
  },
  description:
    "Epsilon is an AI assistant that reasons in the open, cites as it goes and tells you how sure it is.",
  applicationName: "Epsilon",
  openGraph: {
    title: "Epsilon — answers with a margin of error",
    description:
      "An AI assistant that reasons in the open, cites as it goes and tells you how sure it is.",
    type: "website",
    siteName: "Epsilon",
  },
  // The site is already dark. Ask Dark Reader to leave it alone: its rewritten
  // inline styles break hydration and flatten the glass.
  other: { "darkreader-lock": "true" },
};

export const viewport: Viewport = {
  themeColor: "#040508",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Let the on-screen keyboard resize the layout so the chat composer stays visible.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <LiquidBackdrop />
        <LightField />
        <Providers>{children}</Providers>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
