import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/viager");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur viager — bouquet, rente et fiscalité"
        description="Comparez les scénarios de bouquet et de rente, la valeur d'occupation et la fiscalité. Calcul financier ou coefficient actuariel fourni par votre professionnel."
        path="/viager"
      />
      {children}
    </>
  );
}
