import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grile Licenta UTM - Alege Materiile",
  description:
    "Alege materiile si incepe sa rezolvi grile pentru licenta UTM Informatica 2026. Programare C++, Java, Python, baze de date SQL, retele, criptografie si web.",
  alternates: {
    canonical: "https://utmlearn.com/practica",
  },
};

export default function PracticaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
