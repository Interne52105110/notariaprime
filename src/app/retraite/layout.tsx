import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/retraite");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Simulateur retraite — pension, cotisations, fiscalité"
        description="Estimez votre future pension de retraite : régime de base, complémentaire AGIRC-ARRCO, décote/surcote, abattement 10%, comparaison statuts (cadre, TNS, fonction publique)."
        path="/retraite"
      />
      {children}
    </>
  );
}
