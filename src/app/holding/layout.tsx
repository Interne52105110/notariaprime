import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/holding");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur Holding patrimoniale — fiscalité, montage, IS vs IR"
        description="Simulez le montage d'une holding patrimoniale : régime mère-fille, intégration fiscale, apport-cession 150-0 B ter, comparaison IS/IR. Frais notariés et fiscalité chiffrés."
        path="/holding"
      />
      {children}
    </>
  );
}
