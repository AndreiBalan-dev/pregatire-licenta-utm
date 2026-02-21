import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salveaza Progresul",
  description:
    "Salveaza progresul tau la grilele de licenta UTM si obtine o cheie unica pentru a-l recupera mai tarziu de pe orice dispozitiv.",
  alternates: {
    canonical: "https://utmlearn.com/salveaza",
  },
};

export default function SalveazaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
