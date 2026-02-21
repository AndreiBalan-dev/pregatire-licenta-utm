import type { Metadata, Viewport } from "next";
import { Syne, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const siteUrl = "https://utmlearn.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0E" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pregătire Licență UTM | Grile 2026",
    template: "%s | Pregătire Licență UTM",
  },
  description:
    "Platforma gratuită de pregătire pentru examenul de licență UTM 2026. 652 de exerciții grilă din programare, baze de date, rețele și tehnologii web.",
  keywords: [
    "licență UTM",
    "grile informatică",
    "pregătire examen UTM",
    "grile licență 2026",
    "programare grile",
    "baze de date grile",
    "rețele calculatoare grile",
    "tehnologii web grile",
    "UTM informatică",
    "examen licență informatică",
    "grile programare Python",
    "grile Java",
    "grile C++",
    "grile SQL",
    "pregătire licență informatică",
  ],
  authors: [{ name: "Bălan Andrei Marian" }],
  creator: "Bălan Andrei Marian",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteUrl,
    siteName: "Pregătire Licență UTM",
    title: "Pregătire Licență UTM | Grile 2026",
    description:
      "Platforma gratuită de pregătire pentru examenul de licență UTM 2026. 652 de exerciții grilă din programare, baze de date, rețele și tehnologii web.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pregătire Licență UTM | Grile 2026",
    description:
      "652 exerciții grilă gratuite pentru licența UTM 2026. Programare, baze de date, rețele, web.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pregătire Licență UTM",
    description:
      "Platforma gratuită de pregătire pentru examenul de licență UTM 2026. 652 de exerciții grilă.",
    url: siteUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    author: {
      "@type": "Person",
      name: "Bălan Andrei Marian",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RON",
    },
    inLanguage: "ro",
  };

  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${syne.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
