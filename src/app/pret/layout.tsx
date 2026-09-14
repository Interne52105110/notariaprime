import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/pret");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Prêt immobilier : mensualité et coût du crédit"
        description="Prêt à taux fixe : mensualités, assurance, frais et échéancier."
        path="/pret"
      />
      {children}
    </>
  );
}
