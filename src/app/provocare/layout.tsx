import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provocare - Licenţă UTM",
  description: "Creează o provocare şi joacă cu prietenii.",
};

export default function ProvocareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
