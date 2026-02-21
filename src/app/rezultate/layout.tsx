import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rezultate Grile Licenta UTM",
  description:
    "Urmareste progresul tau la grilele de licenta UTM Informatica. Statistici pe module: programare, baze de date, retele si tehnologii web.",
  alternates: {
    canonical: "https://utmlearn.com/rezultate",
  },
};

export default function RezultateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
