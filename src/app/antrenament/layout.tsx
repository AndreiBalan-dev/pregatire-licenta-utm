import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Antrenament Nelimitat - Grile Licenta UTM",
  description:
    "Exerseaza nelimitat grile pentru licenta UTM Informatica 2026. Alegi tot, un modul sau o materie, iar algoritmul iti readuce greselile mai des si pe cele stiute mai rar.",
  alternates: {
    canonical: "https://utmlearn.com/antrenament",
  },
};

export default function AntrenamentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
