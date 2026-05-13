import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/donation");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur Donation 2026 — droits, abattements parent-enfant"
        description="Calculez les droits de donation : abattement 100 000 € parent-enfant, 31 865 € grand-parent, 80 724 € conjoint. Barème progressif, présent d'usage, donation-partage."
        path="/donation"
      />
      {children}
    </>
  );
}
