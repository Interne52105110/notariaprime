import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/ifi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur IFI 2026 — Impôt sur la Fortune Immobilière"
        description="Simulez votre IFI 2026 : barème progressif au-delà de 1,3 M€, abattement résidence principale 30%, plafonnement, dettes déductibles. Calcul gratuit, conforme dernière réforme."
        path="/ifi"
      />
      {children}
    </>
  );
}
