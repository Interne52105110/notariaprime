import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/pret");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Simulateur prêt immobilier — capacité d'emprunt, mensualité, TAEG"
        description="Calculez votre capacité d'emprunt, votre mensualité, le coût total du crédit et le TAEG. Tableau d'amortissement, assurance emprunteur, comparaison taux fixe/variable."
        path="/pret"
      />
      {children}
    </>
  );
}
