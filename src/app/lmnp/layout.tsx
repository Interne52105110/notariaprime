import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/lmnp");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur LMNP 2026 — amortissement, fiscalité, régime réel"
        description="Simulez votre fiscalité LMNP (Loueur Meublé Non Professionnel) : amortissement bien + mobilier, régime réel vs micro-BIC, déficit reportable, plus-value. Conforme PLF 2026."
        path="/lmnp"
      />
      {children}
    </>
  );
}
