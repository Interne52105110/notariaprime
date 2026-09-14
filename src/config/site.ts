// Origine canonique unique du site. Doit correspondre au domaine principal
// configuré dans Vercel (celui vers lequel l'autre hôte est redirigé) :
// canonicals, sitemap, robots.txt et JSON-LD en dérivent tous.
// Surchargeable via NEXT_PUBLIC_SITE_URL (préprod, changement d'hôte).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.notariaprime.fr").replace(/\/+$/, "");
