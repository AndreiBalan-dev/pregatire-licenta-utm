import type { Metadata } from "next";
import { SITE_URL, TOTAL_QUESTIONS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cautare",
  description: `Cauta in toate cele ${TOTAL_QUESTIONS} de intrebari de la licenta UTM: filtreaza dupa materie, cod, figura, explicatie sau progresul tau si porneste exact ce vrei sa exersezi.`,
  alternates: {
    canonical: `${SITE_URL}/cautare`,
  },
};

export default function CautareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
