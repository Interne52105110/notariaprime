import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/viager");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur viager — bouquet, rente, espérance de vie"
        description="Calculez le bouquet et la rente viagère d'un bien immobilier : barème INSEE espérance de vie, valeur d'occupation, viager libre vs occupé, fiscalité de la rente."
        path="/viager"
      />
      {children}
    </>
  );
}
