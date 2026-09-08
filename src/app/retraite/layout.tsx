import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/retraite");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Simulateur retraite — pension, cotisations, fiscalité"
        description="Projetez votre retraite à partir de vos relevés : pension de base, complémentaire, décote et surcote, prélèvements sociaux et comparaison des dates de départ."
        path="/retraite"
      />
      {children}
    </>
  );
}
