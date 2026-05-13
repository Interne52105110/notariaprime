import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/assurance-vie");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur Assurance vie 2026 — fiscalité, succession, abattements"
        description="Simulez la fiscalité de votre contrat d'assurance vie : versements avant/après 70 ans, abattement 152 500 €, prélèvement 20%/31,25%, transmission. Gratuit, conforme 2025/2026."
        path="/assurance-vie"
      />
      {children}
    </>
  );
}
