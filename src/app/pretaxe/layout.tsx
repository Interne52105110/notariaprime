import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/pretaxe");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur prélèvement à la source — taux, revenus, retenue"
        description="Simulez votre taux de prélèvement à la source : taux personnalisé, taux neutre, taux individualisé, retenue sur salaire, acomptes BIC/BNC. Mise à jour barème 2026."
        path="/pretaxe"
      />
      {children}
    </>
  );
}
