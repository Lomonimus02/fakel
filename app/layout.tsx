import type { Metadata } from "next";
import { Manrope, Oswald } from "next/font/google";
import { CookieBanner } from "@/components/layout";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "800"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Planteo — Аренда спецтехники",
    template: "%s | Planteo — Аренда спецтехники",
  },
  description:
    "Planteo — профессиональная аренда строительной и специальной техники в Санкт-Петербурге. Экскаваторы, краны, самосвалы с экипажем. Работаем 24/7.",
  keywords: [
    "аренда спецтехники",
    "аренда экскаватора",
    "аренда крана",
    "спецтехника СПб",
    "строительная техника",
  ],
  authors: [{ name: "Planteo" }],
  creator: "Planteo",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Planteo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Аренда спецтехники",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${oswald.variable} font-sans antialiased`}
      >
        {/* Texture noise background */}
        <div className="bg-noise" aria-hidden="true"></div>

        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
