import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre Platforma",
  description:
    "UTM Learn - platforma gratuita de pregatire pentru examenul de licenta la Facultatea de Informatica, UTM. Creata de Balan Andrei Marian.",
  alternates: {
    canonical: "https://utmlearn.com/despre",
  },
};

export default function DespreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
