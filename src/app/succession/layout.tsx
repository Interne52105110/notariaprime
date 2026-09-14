import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/succession");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name="Calculateur droits de succession 2026 — abattements, barème par héritier"
        description="Calculez les droits de succession dus par chaque héritier ou légataire : abattements selon le lien de parenté, barème progressif, représentation, nue-propriété, rappel des donations."
        path="/succession"
      />
      {children}
    </>
  );
}
