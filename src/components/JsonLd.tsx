// JSON-LD structured data for Google rich results.
// Rendered via Next.js Script with type="application/ld+json" so the
// payload is in the HTML <head> at SSR (not after hydration), which is
// what Google's crawler reads.

const BASE = "https://notariaprime.fr";

function JsonLd({ data, id }: { data: object; id: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      id="ld-organization"
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "NotariaPrime",
        url: BASE,
        logo: `${BASE}/images/og-image.png`,
        description: "Plateforme open source de calculateurs notariés et fiscaux français, conforme au tarif réglementé 2026/2028.",
        sameAs: [],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      id="ld-website"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "NotariaPrime",
        url: BASE,
        inLanguage: "fr-FR",
        publisher: { "@type": "Organization", name: "NotariaPrime", url: BASE },
      }}
    />
  );
}

/**
 * Per-calculator schema.org/SoftwareApplication. Used inside each
 * calculator's layout to give Google a clear signal that the page is an
 * interactive tool (eligible for Software Application rich results).
 */
export function CalculatorJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      id={`ld-calc-${path.replace(/[^a-z]/gi, "-")}`}
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        description,
        url: `${BASE}${path}`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        inLanguage: "fr-FR",
        publisher: { "@type": "Organization", name: "NotariaPrime", url: BASE },
      }}
    />
  );
}
