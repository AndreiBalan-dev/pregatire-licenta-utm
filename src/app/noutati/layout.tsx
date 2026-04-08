import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noutati & Changelog",
  description:
    "Istoricul actualizarilor platformei UTM Learn - toate versiunile, functiile noi si corecturile.",
  alternates: {
    canonical: "https://utmlearn.com/noutati",
  },
};

export default function NoutatiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
