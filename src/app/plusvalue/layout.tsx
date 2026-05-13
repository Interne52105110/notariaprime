import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/plusvalue");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur plus-value immobilière 2026 — abattements, exonérations"
        description="Calculez la plus-value immobilière nette : abattement durée de détention IR + prélèvements sociaux, exonération résidence principale, taux 19% + 17,2% PS, surtaxe au-delà 50 000 €."
        path="/plusvalue"
      />
      {children}
    </>
  );
}
