import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/plusvalue-pro");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur plus-value professionnelle — sociétés, entreprises"
        description="Simulez la plus-value professionnelle sur cession d'éléments d'actif : régime court terme/long terme, article 151 septies, 238 quindecies, 41 (transmission entreprise)."
        path="/plusvalue-pro"
      />
      {children}
    </>
  );
}
