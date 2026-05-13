import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/revenus-fonciers");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur revenus fonciers — fiscalité, micro vs réel"
        description="Calculez vos revenus fonciers nets imposables : régime micro-foncier (abattement 30%) vs régime réel (déduction des charges), déficit foncier 10 700 €, imputation sur revenu global."
        path="/revenus-fonciers"
      />
      {children}
    </>
  );
}
