import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sesiune Simulator Examen",
  description: "Sesiune activa de simulator examen licenta UTM Informatica.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SimulatorExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
