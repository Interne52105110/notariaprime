# Calculateurs, guides et photographie — 14 septembre 2026

## Changements

- Affichage du plafonnement IFI borné à l’impôt effectivement effacé. Le montant final était déjà borné à zéro ; l’écart concernait la réduction annoncée.
- Plafond Pinel affiché identique à celui de l’éligibilité, avec coefficient de surface ; ressources renommées 2026. Effort d’épargne calculé après fiscalité.
- FAQ assurance-vie corrigée : un rachat suivi d’un PER ne conserve pas l’antériorité de l’assurance-vie.
- Cessions LMNP antérieures à 2026 refusées dans le modèle aux règles 2026 constantes.
- Option IR du foyer avant/après dans LMNP, foncier, SCI et Relance : barème, plafonnement ordinaire du quotient familial et décote. Une simulation à 25 000 € puis 35 000 € pour une personne sans enfant passe de 1 244 € à 3 604 € avant crédits/réductions, soit une variation de 2 360 €.
- Trois outils supplémentaires : capacité et budget, achat/location/revente en direct ou SCI IS, amortissement Relance logement. Catalogue de 19 calculateurs, succession comprise.
- Douze guides rendus sur le serveur, titres/métas/canonical uniques, schéma Article, sources, exemples et pièces. Accès depuis l’accueil, les outils et le pied de page ; sitemap étendu.
- Encarts d’aide et impression sur les 19 outils. Nettoyage des promesses SEO et des chiffres d’audience non étayés. Fichiers historiques SCI explicitement signalés comme tels.
- Photo Pixabay sans texte, maison en bois sur l’herbe. Source et licence dans `image-credits.md`. Cadre réservé et variantes `next/image` conservés.

## Validation

`npm test` : 151 tests, dont 27 nouveaux cas sur les corrections, les foyers, les prêts, les déductions et les flux à la vente. La suite historique garde ses avertissements des modèles sociaux Urssaf. Ils ne constituent pas de nouveaux échecs introduits par cette livraison.

TypeScript et compilation Next vérifiés. Contrôles navigateur sur capacité, Relance, comparaison immobilière, modification du foyer en foncier, index et guide, photographie. Largeur mobile de 390 px, tableaux comparatifs à défilement horizontal.

Contrôle HTTP du build de production : 47 URL de sitemap en 200, un H1 par page, titres et descriptions uniques, canonical correct, aucune balise noindex sur ces pages et schéma Article présent pour les douze guides. ESLint : zéro erreur, 82 avertissements principalement hérités de fichiers anciens.

## Périmètre fiscal explicite

L’IR du foyer traite les cas ordinaires métropolitains, enfants à charge exclusive, hors parent isolé, parts particulières, veuvage spécial, revenu exceptionnel/étranger, réductions/crédits, CSG déductible, CEHR/CDHR et seuil de recouvrement. Le barème 2026 sur revenus 2025 est maintenu constant pour les projections. SCI en mode foyer : un même foyer pour toutes les parts, zéro intérêt de CCA et dividendes au PFU.

Relance : acquisitions éligibles du 21 février 2026 au 31 décembre 2028. Base hors frais et 20 % de terrain, travaux de réhabilitation intégrés en ancien, prorata par mois, cumul et plafond partagé du foyer. Le niveau d’un logement ne suffit pas à valider la majoration de plafond du foyer. Qualification, DPE, bail, ressources et loyer à confirmer. Déficit global plafonné à 10 700 €, sans majoration énergétique ni liquidation des reports antérieurs/global non absorbé. Textes : CGI article 31, loi de finances 2026 article 47 et fiche Service Public F39735, consultés le 14 septembre.

Comparaison immobilière : location nue, années complètes, fiscalité constante, financement des apports SCI en CCA non rémunéré, aucun dividende avant vente. IS de cession combiné à l’exploitation et aux déficits. Distinction des avances, remboursement de dette et dividendes. Frais de crédit, constitution/liquidation, capital social, transmission, IFI et fiscalité internationale exclus. Solde nominal sans actualisation. Ce n’est pas une liquidation juridique de SCI.

## Suivi éditorial

Le guide donation décrit une exonération temporaire se terminant le 31 décembre 2026. À cette échéance, conserver les dates historiques et préciser qu’elle ne s’applique plus aux nouveaux dons, sauf prolongation effectivement publiée. Relance et les projections gardent leur millésime documenté jusqu’à une revue fondée sur les textes nouveaux.

Pour mesurer les résultats, comparer dans Search Console des périodes complètes après indexation : impressions, clics et requêtes des nouveaux guides, puis accès aux outils et demandes de contact. Aucun montant patrimonial ni paramètre de foyer ne doit être envoyé à l’analytique. Aucun résultat de référencement n’est promis.
