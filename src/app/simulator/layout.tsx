import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulator Examen Licenta UTM",
  description:
    "Simulator examen licenta UTM Informatica - 36 grile balansate, sistem oficial de notare (1p oficiu + 0.25p/corect), notatie pe scala 1-10. Gratuit.",
  alternates: {
    canonical: "https://utmlearn.com/simulator",
  },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
