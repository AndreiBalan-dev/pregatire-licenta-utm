import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provocare - Licență UTM",
  description: "Creează o provocare și joacă cu prietenii.",
};

export default function ProvocareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
