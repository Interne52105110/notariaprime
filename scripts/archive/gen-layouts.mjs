#!/usr/bin/env node
// One-shot: generate a layout.tsx per route so each page exports its own
// metadata via src/lib/seo.ts. Calculator layouts also inject a
// schema.org/SoftwareApplication JsonLd snippet for Google rich results.

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CALCULATEURS = [
  "assurance-vie", "donation", "holding", "ifi", "investissement-locatif",
  "lmnp", "plusvalue", "plusvalue-pro", "pret", "pretaxe", "retraite",
  "revenus-fonciers", "sci", "statut-juridique", "viager",
];

const EDITO_LEGAL = [
  "about", "features", "prestations",
  "prestations/comptabilite-notariale",
  "prestations/developpement-informatique",
  "prestations/expertise-immobiliere",
  "documentation", "contact", "roadmap",
  "mentions-legales", "cgu", "confidentialite",
];

// Read titles/descriptions from src/lib/seo.ts so the JsonLd matches
// what Google reads in <meta>. Avoids drift between metadata and schema.
const seoSource = readFileSync("C:/notariaprime/src/lib/seo.ts", "utf8");
function pickMeta(slug) {
  const re = new RegExp(`"/${slug.replace(/\//g, "\\/")}":\\s*\\{[^}]*?title:\\s*"([^"]+)",[^}]*?description:\\s*"([^"]+)"`, "s");
  const m = seoSource.match(re);
  if (!m) throw new Error(`Could not parse meta for /${slug}`);
  return { title: m[1], description: m[2] };
}

const CALC_TEMPLATE = (slug) => {
  const { title, description } = pickMeta(slug);
  return `import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CalculatorJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata("/${slug}");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalculatorJsonLd
        name=${JSON.stringify(title)}
        description=${JSON.stringify(description)}
        path="/${slug}"
      />
      {children}
    </>
  );
}
`;
};

const EDITO_TEMPLATE = (slug) => `import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/${slug}");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;

let written = 0;
for (const slug of CALCULATEURS) {
  const dir = join("C:/notariaprime/src/app", slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "layout.tsx"), CALC_TEMPLATE(slug));
  written++;
}
for (const slug of EDITO_LEGAL) {
  const dir = join("C:/notariaprime/src/app", slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "layout.tsx"), EDITO_TEMPLATE(slug));
  written++;
}
console.log(`Done. ${written} layouts written.`);
