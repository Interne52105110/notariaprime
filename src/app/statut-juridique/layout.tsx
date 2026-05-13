import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/statut-juridique");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Comparateur statut juridique — SAS, SARL, EURL, SCI, micro"
        description="Comparez les statuts juridiques pour votre activité : SAS, SASU, SARL, EURL, SCI, auto-entrepreneur. Fiscalité, charges sociales, responsabilité, capital, transmission."
        path="/statut-juridique"
      />
      {children}
    </>
  );
}
