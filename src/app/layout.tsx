import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Projeto Semear | Missão no Nordeste",
    template: "%s | Projeto Semear",
  },
  description:
    "O Projeto Semear aproxima pessoas, igrejas e comunidades para cultivar esperança no Nordeste brasileiro.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Projeto Semear",
    title: "Projeto Semear | Missão no Nordeste",
    description:
      "Semear esperança. Cultivar transformação junto às comunidades do Nordeste.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Projeto Semear — missão no Nordeste",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projeto Semear | Missão no Nordeste",
    description:
      "Semear esperança. Cultivar transformação junto às comunidades do Nordeste.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#173d2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}