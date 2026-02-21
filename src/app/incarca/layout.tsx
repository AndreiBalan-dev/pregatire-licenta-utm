import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incarca Sesiune",
  description:
    "Incarca o sesiune salvata anterior folosind cheia unica. Continua pregatirea pentru licenta UTM de unde ai ramas.",
  alternates: {
    canonical: "https://utmlearn.com/incarca",
  },
};

export default function IncarcaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
