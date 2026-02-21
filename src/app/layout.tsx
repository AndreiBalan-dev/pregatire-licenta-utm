import type { Metadata, Viewport } from "next";
import { Syne, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
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
    "Platforma gratuita de pregatire pentru examenul de licenta UTM Informatica 2026. 665 grile din programare, baze de date, retele si tehnologii web.",
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
      "Platforma gratuita de pregatire pentru examenul de licenta UTM Informatica 2026. 665 grile din programare, baze de date, retele si tehnologii web.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pregatire Licenta UTM - 665 grile informatica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pregătire Licență UTM | Grile Informatica 2026",
    description:
      "665 grile gratuite pentru licenta UTM Informatica 2026. Programare, baze de date, retele, web.",
    images: ["/og-image.png"],
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
    languages: {
      "ro": siteUrl,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Pregătire Licență UTM",
        description:
          "Platforma gratuita de pregatire pentru examenul de licenta UTM Informatica 2026. 665 grile din programare, baze de date, retele si tehnologii web.",
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
      },
      {
        "@type": "Course",
        name: "Grile Licenta UTM Informatica 2026",
        description: "665 exercitii grila pentru pregatirea examenului de licenta la Facultatea de Informatica, UTM.",
        provider: {
          "@type": "Organization",
          name: "UTM Learn",
          url: siteUrl,
        },
        isAccessibleForFree: true,
        inLanguage: "ro",
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: "PT10H",
        },
        numberOfCredits: 0,
        educationalLevel: "Bachelor",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Practică", item: `${siteUrl}/practica` },
          { "@type": "ListItem", position: 3, name: "Rezultate", item: `${siteUrl}/rezultate` },
        ],
      },
    ],
  };

  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
