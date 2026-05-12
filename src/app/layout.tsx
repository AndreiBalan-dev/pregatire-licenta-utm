import type { Metadata, Viewport } from "next";
import { Syne, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  AUTHOR_NAME,
  TOTAL_QUESTIONS,
  EXAM_SESSION_YEAR,
} from "@/lib/site-config";

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

const siteUrl = SITE_URL;
const metaDescription = `Platforma gratuita de pregatire pentru examenul de licenta UTM Informatica ${EXAM_SESSION_YEAR}. ${TOTAL_QUESTIONS} grile din programare, baze de date, retele si tehnologii web.`;
const metaTitle = `${SITE_NAME} | Grile ${EXAM_SESSION_YEAR}`;

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
    default: metaTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: metaDescription,
  keywords: [
    "licență UTM",
    "grile informatică",
    "pregătire examen UTM",
    `grile licență ${EXAM_SESSION_YEAR}`,
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
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteUrl,
    siteName: SITE_NAME,
    title: metaTitle,
    description: metaDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `Pregatire Licenta UTM - ${TOTAL_QUESTIONS} grile informatica` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Grile Informatica ${EXAM_SESSION_YEAR}`,
    description: `${TOTAL_QUESTIONS} grile gratuite pentru licenta UTM Informatica ${EXAM_SESSION_YEAR}. Programare, baze de date, retele, web.`,
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
        name: SITE_NAME,
        description: metaDescription,
        url: siteUrl,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
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
        name: `Grile Licenta UTM Informatica ${EXAM_SESSION_YEAR}`,
        description: `${TOTAL_QUESTIONS} exercitii grila pentru pregatirea examenului de licenta la Facultatea de Informatica, UTM.`,
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
