import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Fraunces } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const accent = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-accent",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Semear no Sertão é uma missão da igreja que aproxima pessoas, igrejas e comunidades para espalhar a semente da salvação no sertão nordestino.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Semear no Sertão | Missão no Nordeste",
    template: "%s | Semear no Sertão",
  },
  description,
  icons: { icon: "/images/marca/semear-simbolo.svg" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Semear no Sertão",
    title: "Semear no Sertão | Missão no Nordeste",
    description: "Espalhando a semente da salvação no sertão nordestino.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Semear no Sertão — missão no Nordeste" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Semear no Sertão | Missão no Nordeste",
    description: "Espalhando a semente da salvação no sertão nordestino.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ec",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${accent.variable}`}>
      {/* extensões do navegador costumam injetar atributos no <body> (ex.: inmaintabuse) */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
