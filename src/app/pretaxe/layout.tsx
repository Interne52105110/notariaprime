import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/pretaxe");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur frais de notaire 2026 — émoluments, DMTO, prétaxe des actes"
        description="Calculez les frais de notaire d'une vente, donation, succession ou acte de société : émoluments au tarif réglementé 2026/2028, droits de mutation par département, CSI, formalités et débours."
        path="/pretaxe"
      />
      {children}
    </>
  );
}
