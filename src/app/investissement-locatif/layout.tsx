import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/investissement-locatif");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Simulateur investissement locatif — rentabilité, cashflow, fiscalité"
        description="Calculez la rentabilité brute, nette et nette-nette d'un investissement locatif. Cashflow mensuel, fiscalité (micro-foncier, réel, LMNP), TRI sur 20 ans, sensibilité aux loyers."
        path="/investissement-locatif"
      />
      {children}
    </>
  );
}
