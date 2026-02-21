import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revizuire Greseli - Grile Licenta UTM",
  description:
    "Revizuieste intrebarile gresite si marcate din grilele de licenta UTM Informatica. Invata din greseli si imbunatateste-ti scorul.",
  alternates: {
    canonical: "https://utmlearn.com/revizuire",
  },
};

export default function RevizuireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
