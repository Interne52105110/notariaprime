import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/sci");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Simulateur SCI — IR vs IS, fiscalité, transmission"
        description="Comparez SCI à l'IR vs SCI à l'IS : fiscalité des loyers, amortissement, plus-value, transmission par parts. Coûts de création, frais notariés, exemples chiffrés."
        path="/sci"
      />
      {children}
    </>
  );
}
