# NotariaPrime — revue des calculs du 8 septembre 2026

État intermédiaire : revue encore en cours, 99 tests réussis au lot plus-values immobilières `d1d8216`, déploiement confirmé.

Cette revue porte sur les règles et défauts listés ci-dessous. Elle ne constitue pas une certification exhaustive de tous les actes notariés, régimes spéciaux ou simulateurs du site. Les projections supposent la stabilité des règles choisies ; elles ne prédisent pas les lois futures.

## Corrections et contrôles

| Module | Correction / règle contrôlée | Exemple testé |
|---|---|---|
| Plus-value immobilière, LMNP, SCI | Abattements en années révolues ; PS à 22 ans ; surtaxe avec lissage légal | 22 ans : IR 100 %, PS 28 %. PV IR de 103 400 € : surtaxe 2 442 € |
| Plus-value immobilière | Forfait travaux après plus de cinq ans ; absence de remploi présumé ; abattement exceptionnel après celui de durée | Cinq ans exactement ne suffit pas, le lendemain oui |
| Donation | Barème époux/PACS, suppression de l’abattement successoral de 1 594 € entre non-parents ; rappel de donations ; bénéficiaire explicitement sélectionné | 100 000 € entre époux : 1 691,20 € avant arrondi fiscal ; rappel de 150 000 € puis don de 100 000 € à un enfant : 20 000 € |
| Donation | Dutreil 75 % conservé lors du démembrement ; engagement individuel de six ans ; confirmations des conditions et plafonds des dons d’argent | Les exonérations spéciales ne sont plus présumées disponibles |
| Revenus fonciers | Loyers imputés en priorité sur les intérêts ; suppression d’une économie sociale fictive sur l’imputation au revenu global | Loyers 15 000 €, intérêts 18 000 €, autres charges 20 000 € : imputation 10 700 €, report 12 300 € |
| IFI | Seuil strictement supérieur à 1,3 M€, décote ; plafond de la dette de RP ; limite des dettes pour gros patrimoines | 1,3 M€ : 0 € ; 1,35 M€ : 2 225 € ; 1,4 M€ : 3 200 € avant plafonnement |
| SCI | Prêt à 0 %, zéro revalorisation, absence de crédit fiscal sur moins-value, surtaxe incluse ; suppression de la majoration IS arbitraire de 40 % | Emprunt 120 000 € sur dix ans à 0 % : 1 000 €/mois |
| Plus-value professionnelle | Prix de cession comparé à la valeur nette comptable | Acquisition 100 000 €, amortissements 40 000 €, cession 80 000 € : PV 20 000 € |
| Prétaxe | Dix taux départementaux mis à 5 %, cas primo ; TPF réduite neuf ; conservation des saisies lors des recalculs ; mobilier justifié | Neuf, assiette 100 000 € : TPF 700 €, frais 15 € ; vente 300 000 € : émolument HT 2 794,25 € avant remise |
| IR | Barème de l’impôt 2026 sur les revenus 2025 partagé entre modules | Seuils 11 600 / 29 579 / 84 577 / 181 917 € |

## Sources officielles consultées

- [Tarifs notariaux, arrêté du 25 février 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053593921), [Code de commerce, tarifs des notaires](https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032132058) : tarif ordinaire de vente A444-91, remise A444-174. Le nouvel arrêté ne justifie pas une hausse générale de ce barème.
- [Tableau DGFiP des DMTO au 1er juin 2026](https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/dmto/dmto_2026-06.pdf) : dernier tableau trouvé, pages départementales inspectées visuellement. Les abattements/réductions conditionnels locaux ne sont pas automatiquement appliqués.
- [DGFiP — frais d’acquisition](https://www.impots.gouv.fr/particulier/questions/jachete-un-bien-immobilier-quaurai-je-payer-comme-frais-au-notaire) : droits ancien/neuf, prélèvement sur la part départementale, CSI, émolument de vente.
- [BOFiP — surtaxe des plus-values](https://bofip.impots.gouv.fr/bofip/8597-PGP.html/identifiant=BOI-RFPI-TPVIE-20-20230718), [DGFiP — plus-values imposées](https://www.impots.gouv.fr/particulier/plus-values-imposees) : CGI 150 VC et 1609 nonies G.
- [DGFiP — donations, calcul des droits](https://www.impots.gouv.fr/particulier/calcul-et-paiement-des-droits), [dons exonérés](https://www.impots.gouv.fr/particulier/dons-exoneres), [Dutreil, actualité BOFiP août 2026](https://bofip.impots.gouv.fr/bofip/15125-PGP.html/ACTU-2026-00114).
- [BOFiP — déficit foncier](https://bofip.impots.gouv.fr/bofip/4142-PGP.html/identifiant=BOI-RFPI-BASE-30-20-20250916).
- [DGFiP — calcul de l’IFI](https://www.impots.gouv.fr/particulier/calcul-de-lifi), [passif déductible](https://www.impots.gouv.fr/particulier/questions/que-puis-je-deduire-au-niveau-du-passif-de-limpot-sur-la-fortune-immobiliere).
- [BOFiP — barème IR 2026](https://bofip.impots.gouv.fr/bofip/2491-PGP.html/identifiant=BOI-IR-LIQ-20-10-20260407).
- [BOFiP — valeur comptable des actifs professionnels](https://bofip.impots.gouv.fr/bofip/4677-PGP.html/identifiant=BOI-BNC-BASE-30-20-20120912).
- [DGFiP — prélèvements sociaux de la location](https://www.impots.gouv.fr/particulier/questions/je-donne-un-bien-en-location-dois-je-payer-des-prelevements-sociaux), [revenus mobiliers](https://www.impots.gouv.fr/particulier/les-revenus-mobiliers), [assurance-vie](https://www.impots.gouv.fr/particulier/lassurance-vie-et-le-pea-0) : les taux 18,6 % / 17,2 % doivent rester distingués selon le revenu ; pas de remplacement général.

## Périmètre et limites concrètes

- Droits de succession (impôt dû à l’État, distinct des frais des actes notariaux) : l’ancien onglet réutilisait le calcul de donation, sans liquidation successorale distincte. Il a été remplacé par le module fiscal distinct `/succession`, qui utilise des parts nettes civiles déjà déterminées. Les actes notariaux de succession restent présents dans la prétaxe ; leurs émoluments, formalités, débours et taxes d’acte ne sont pas les droits de succession.
- Donation : calcul par couple donateur/bénéficiaire, abattements disponibles à confirmer. Les historiques complexes et plafonds partiellement consommés de dons spéciaux nécessitent un calcul individualisé. La réduction de droits de 50 % de l’article 790 pour certaines donations Dutreil en pleine propriété avant 70 ans est calculée par double liquidation de la fraction éligible.
- SCI transmission : valeur nette des parts saisie par l’utilisateur, un seul parent, partage égal entre enfants associés (un enfant si aucun), abattement intact. Ce calcul n’est pas une valorisation comptable de la société ni une liquidation successorale complète.
- Prétaxe : estimation de frais. Débours/formalités restent dépendants du dossier. Neuf : assiette hors TVA immobilière. Tarifs Alsace-Moselle, actes composites, réductions locales spécifiques, exonérations personnelles et mutations complexes nécessitent une taxe adaptée.
- IFI : résident fiscal français pour le plafonnement ; revenus mondiaux nets et IR/PS N-1 à renseigner. Zéro explicite est distingué du champ vide. Les prêts in fine/familiaux, justification permettant d’écarter la limite des dettes, démembrements complexes et déductibilité de l’IFI lui-même demandent un traitement distinct.
- Plus-values : droits démembrés, multiples cédants, exonérations non-résidents et opérations d’aménagement demandent une vérification des actes et conditions. Le simulateur ne liquide pas tous ces cas spéciaux. L’exonération retraite exige confirmation des critères N-2 ; aucun plafond historique fixe n’est présumé valable.
- Les revues détaillées retraite, viager, investissements, holding, statuts et assurance-vie figurent dans les lots ci-dessous. Leurs hypothèses et limites explicites demeurent applicables ; aucune certification juridique universelle n’est revendiquée.

## Validation technique — premier lot (historique)

Tests automatisés des règles et cas limites dans `tests/fiscal.test.cjs`, exécutés avec `npm test`. Les tests s’appuient sur des exemples chiffrés et frontières de barème, pas seulement sur les constantes. 41 tests unitaires réussis ; parcours navigateur donation (deux bénéficiaires), prétaxe ancien/neuf, IFI, et chargement de 17 routes. Contrôles TypeScript, lint et compilation de production avant publication. Les avertissements préexistants du lint ne sont pas assimilés à des validations fiscales.


## Lot complémentaire — revue approfondie en cours

- Droits de succession : nouveau moteur et route `/succession`, parts nettes saisies par héritier, abattements, exonérations conjoint/PACS et fratrie conditionnelle, représentation, rappel des tranches et nue-propriété. Le périmètre fiscal est distinct de la détermination civile des parts.
- Dutreil : réduction de droits de 50 % avant 70 ans, exclusion des droits démembrés, double liquidation de la fraction éligible.
- Prétaxe : six actes complémentaires (certificat mobilier, délivrances de legs, ouverture de testament, consentement et cantonnement), assiettes documentées, CSI de l’attestation après décès, majoration territoriale des émoluments fixes. Télétransmission forfaitaire automatique supprimée ; casier judiciaire non présumé pour notoriété/déclaration.
- Retraite : calendrier applicable à compter du 1er septembre 2026, PASS 48 060 €, acquisition de points à 6,2 % et 17 % / 20,1877 €, décote proportionnelle et surcote après plafond. Valeurs du relevé et taux social saisissables ; minimum contributif non accordé sans ses conditions. La revue des régimes professionnels et des scénarios se poursuit.
- Assurance-vie : abattement imputé dans l’ordre légal, primes antérieures comptées dans le seuil de 150 000 €, abattement annuel déjà utilisé ; droits 757 B intégrant abattements successoraux et bases antérieures ; contrôle des quotités totalisant 100 % et du montant de rachat.
- Validation du lot : 70 tests de règles, compilation et contrôles TypeScript/lint réussis. La revue n’est pas encore terminée.

Sources complémentaires : [CGI 790](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006199108/2026-09-01), [actes successoraux A444-59 et suivants](https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032132076/), [DGFiP droits de succession](https://www.impots.gouv.fr/particulier/questions/comment-dois-je-calculer-les-droits-de-succession), [calendrier retraite septembre 2026](https://www.service-public.gouv.fr/particuliers/actualites/A18825), [paramètres Agirc-Arrco](https://www.agirc-arrco.fr/nous-connaitre/nos-etudes-et-publications/documentation-institutionnelle/parametres-et-donnees-statistiques/), [assurance-vie : règles d’imposition](https://bofip.impots.gouv.fr/bofip/11224-PGP.html/identifiant=BOI-RPPM-RCM-20-15-20191220).

## Lot viager — 8 septembre 2026
- Suppression des séries non sourcées présentées comme TGH05/TGF05 et des attributions à Daubry. Aucun calcul automatique de longévité n’est désormais annoncé.
- Scénarios mensuels à terme échu : division linéaire, actualisation à taux effectif annuel (zéro accepté), coefficient actuariel annuel fourni et documenté par le professionnel.
- Le taux imposable 70/50/40/30 % sert exclusivement à l’assiette IR de la rente personnelle, selon l’âge au premier versement. Il ne réduit plus le montant de la rente. Les réversions fiscales particulières restent hors liquidation automatique.
- Valeur économique DUH/usufruit saisie séparément : retrait du coefficient fiscal de 60 % utilisé à tort comme règle de prix et du plafond arbitraire de décote de 70 %.
- Comparaisons de bouquets, sensibilité à la durée, répartition de la taxe foncière et impression conservées. Validation d’un bouquet excessif et invalidation des résultats lors d’une modification.
- Sources : https://www.service-public.gouv.fr/particuliers/vosdroits/F2762 ; https://www.service-public.gouv.fr/particuliers/vosdroits/F3173 ; CGI 762 bis, 1400, 158-6 ; Code civil 1975.
- Validation : 73 tests unitaires réussis, compilation/lint/types, scénario navigateur à taux nul, fraction imposable, bouquet invalide, invalidation et viewport 390 px.

## Lot holding — 8 septembre 2026
- Moteur annuel séparé SCI IS / holding IS : résultat comptable, amortissement non décaissé plafonné au bâti, échéancier du prêt (taux zéro accepté), capital remboursé, trésorerie, reports de pertes et déficits, plafonnement des distributions.
- Quote-part mère-fille de 5 % incluse dans l’IS de la holding après ses frais et déficits ; suppression du rendement de réinvestissement de 3 % appliqué arbitrairement à une seule branche de la comparaison.
- Taux réduit d’IS soumis à confirmation explicite, part du bâti paramétrable, défaut de décote des parts ramené à zéro. La nue-propriété est comparée dans les deux scénarios de donation. L’emprunt désactivé ne réduit plus la valeur des parts.
- Hypothèses affichées : SCI détenue à 100 %, mère-fille éligible hors intégration fiscale, TMI constante, financement à prévoir si trésorerie négative, frais d’entrée et fiscalité de sortie exclus ; réserves légales et dates de décision non simulées.
- Sources : CGI 145, 216, 219, 209, 669 et 776 bis ; https://entreprendre.service-public.gouv.fr/vosdroits/F23575 ; https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048831340/2026-02-15.
- Validation : 77 tests réussis (dont amortissement/cash, prêt sans intérêt, distribution et déficits), build/lint/types, navigation comparaison/flux/transmission et mobile. Routes de production succession et viager accessibles sans exception navigateur.

## Lot statuts juridiques — 8 septembre 2026
- Remplacement des formules SSI historiques et coefficients forfaitaires salarié par les paquets MIT officiels Urssaf `modele-ti@0.1.0` / `modele-as@0.1.0` (publiés le 16 juillet 2026), moteur `publicodes@1.10.1` épinglé. Calcul local, aucune donnée personnelle envoyée à une API.
- Cas synthétique rapproché de l’API officielle : 60 000 € de rémunération brute, 5 000 € de dividendes soumis aux cotisations et 1 000 € soumis aux PS donnent 21 024 € de cotisations, 38 976 € nets hors dividendes, 186 € de PS et 768 € d’IR sur les dividendes.
- Suppression du cumul SSI et prélèvements sociaux du capital sur la même fraction de dividendes. Seuil enrichi des primes d’émission et comptes courants. Rémunération bornée au coût total disponible. SCI IR : PS fonciers 17,2 % inclus. EI/EURL IR : assiette IR professionnelle distincte de la rémunération art. 62.
- Taux réduit IS soumis à confirmation, simulations ACRE basées sur règles 2026, FAQ corrigée (demande/éligibilité, absence de régime « SAS de famille », pas de seuil universel de rentabilité IS). Optimisation et tableau principal utilisent le même moteur.
- Hypothèses explicites : célibataire sans enfant/autre revenu, métropole, année pleine, libéral non réglementé, salarié sans mutuelle facultative/avantages, ATMP 1 %, effectif < 11. Cotisations minimales à vérifier en résultat nul/déficitaire, frais et réserves légales exclus. Pour SARL le scénario attribue l’intégralité du bénéfice distribuable au dirigeant simulé.
- Les paquets amont émettent des avertissements de références circulaires et de conversion d’un zéro sans périodicité. Les cas testés convergent et le cas TI est identique à l’API officielle ; ces avertissements ne sont pas masqués (seuls les avertissements d’utilisation de règles expérimentales sont désactivés). Versions épinglées pour reproductibilité.
- Validation : 81 tests réussis, dont budget à forte rémunération, absence de doubles PS, SCI et assiette IR indépendante ; build/types/lint, 27 cas de revenus/activités, navigateur taux IS/optimisation/FAQ/mobile.
- Sources : https://github.com/betagouv/mon-entreprise/tree/master/modele-ti ; https://github.com/betagouv/mon-entreprise/tree/master/modele-as ; https://entreprendre.service-public.gouv.fr/vosdroits/F38152 ; https://www.urssaf.fr/accueil/actualites/acre-nouvelles-regles-demarches.html.

## Lot investissement locatif — 8 septembre 2026
- Denormandie retrouve les taux propres 12/18/21 % ; calendrier réel par année avec extensions (2 % neuf ans puis 1 % trois ans). Pinel : millésime d’acquisition, engagement initial et taux pleins conditionnels ; aucune acquisition nouvelle 2025+.
- Plafonds de loyers/ressources 2026 et coefficient de surface utile ; conditions particulières et impôt/plafond de niches disponibles renseignés. Fin de l’avantage au terme de l’engagement ; Loc’Avantages six ans, Malraux paiements 2026 avec report sur trois ans de la réduction non imputée.
- Projection : IR/PS locatifs déduits, intérêts et assurance déduits de l’assiette, capital remboursé décaissé, travaux compris une seule fois dans le financement/apport. Déficit foncier : priorité intérêts, imputation globale distincte, reports suivis dix ans, majoration énergétique 2026-2027 sous conditions.
- TRI par recherche de racine encadrée ; pas de taux inventé lorsque le critère de signes ne permet pas de retenir une solution unique. TRI avant fiscalité/frais de cession, hypothèses de revalorisation affichées. Le bouton LMNP mène au simulateur dédié.
- Hypothèses/limites : frais d’acquisition forfaitaires remplacables par devis ; valeur projetée part du prix d’achat (la valeur créée par travaux doit encore être distinguée), IR et plafond de niches constants ; dispositif bailleur privé 2026 non simulé. Les anciens dossiers LMNP sauvegardés dans cette page doivent être revus dans le module dédié.
- Validation : 86 tests réussis, compilation/types/lint, navigateur Denormandie (150 000 € + 11 250 € frais + 60 000 € travaux = 221 250 €, 4 425 € annuels, cash-flow cumulé année 1 = 6 453 € après IR/PS, sans prêt), fin de réduction visible après neuf ans, mobile sans débordement.
- Sources : https://bofip.impots.gouv.fr/bofip/10130-PGP.html/identifiant=BOI-BAREME-000017-20260310 ; https://www.service-public.gouv.fr/particuliers/vosdroits/F35011 ; https://www.service-public.gouv.fr/particuliers/vosdroits/F31151 ; CGI 156 en vigueur juillet 2026 (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000054373682/2026-07-08) ; CGI 199 tervicies.

## Lot partage — 8 septembre 2026
- Trois assiettes distinctes : actif brut déduction faite des legs particuliers pour les émoluments, actif net admissible pour le droit de partage, droits immobiliers publiés pour la CSI. Un partage mobilier ne déclenche plus de CSI/publicité foncière.
- Reprises en nature : émolument complémentaire 0,484 % HT. Droit proportionnel arrondi avec minimum 25 €, sauf exonérations hors périmètre. Soultes et régimes particuliers explicitement hors calcul automatique.
- Validation : 87 tests et build réussis ; navigateur 300 000 € bruts / 200 000 € nets donne 3 490,98 € HT et 5 000 € de droits ; 100 000 € immobiliers donne 100 € CSI ; 50 000 € de reprises ajoute 242 € HT. Mobile vérifié.
- Sources : Code de commerce A444-121 (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684463), CGI 746, 747, 674 ; https://bofip.impots.gouv.fr/bofip/2030-PGP.html/identifiant=BOI-ENR-DG-30-20131223.

## Lot retraite approfondi — 8 septembre 2026
- Suppression de la reconstitution de carrière par salaire actuel et des complémentaires forfaitaires 30/20/5 %. SAM/RAM, points et montants de caisse désormais renseignés. Pas de formule privée appliquée aux professions libérales.
- Durée tous régimes et durée liquidable séparées ; rachats taux seul distincts ; SRE/CNRACL sédentaire sur traitement indiciaire hors primes avec décote/surcote. Taux plein automatique sans durée complète ne crée pas de surcote.
- Correction septembre–décembre 1961 à 169 trimestres ; minoration définitive Agirc-Arrco selon la notice de septembre 2026 ; prélèvements base/complémentaire séparés (cotisation maladie possible).
- Un seul moteur pour la date choisie et les reports de deux/quatre ans. Dates au premier du mois. Revenu net saisi pour remplacement, absence de coefficient net/brut arbitraire. Déclarations de fonctionnalités et FAQ remplacées par des règles sourcées.
- Limites affichées : projection régulière des trimestres futurs, paramètres 2026 constants, SAM fixe ; majorations/bonifications, régimes actifs, départs anticipés et année de liquidation hors automatisation. Les pensions de caisse saisies restent constantes lors des reports ; celles des autres régimes ne sont pas cumulées automatiquement.
- Validation : 92 tests réussis, build/types/lint ; navigateur relevés manquants, salarié 40 000 € SAM / 165 trimestres / 1 000 points sans cotisation future = 1 508,65 € nets mensuels avant IR au 01/10/2026 ; montants saisis préservés, profession libérale, sources, mobile. Impression PDF navigateur disponible.
- Sources : https://www.agirc-arrco.fr/storage/2024/10/Coefficients-de-minorations-AA.pdf (notice septembre 2026) ; https://www.service-public.gouv.fr/particuliers/vosdroits/F14044 ; https://www.service-public.gouv.fr/particuliers/vosdroits/F21142 ; https://www.agirc-arrco.fr/particuliers/ma-retraite/vivre-ma-retraite/prelevements-sociaux/ ; https://www.service-public.gouv.fr/particuliers/vosdroits/F415.

## Lot assurance-vie approfondi — 8 septembre 2026
- Rachat : produits du décompte fiscal et solde des PS de l’assureur prioritaires (zéro et restitution acceptés). Primes encore investies distinctes des produits ; cumuls avant/après septembre 2017 au 31 décembre précédent obligatoires lorsque le seuil de 150 000 € intervient. Suppression du prorata de primes inféré des produits.
- Décès : abattement 757 B réparti sur toutes les bases non exonérées du même assuré, autres contrats compris ; assiette de l’assureur saisissable après rachats/pertes. Comparaison hors AV utilise les mêmes abattements personnels consommés et bases antérieures taxables.
- Projection au rendement effectif annuel, versements en fin de mois, taux zéro ou négatif accepté ; seuil 150 000 € inclus dans les rachats alternatifs projetés. Durée zéro préservée. Retrait des fourchettes de rendement présentées comme des observations non sourcées.
- Limites affichées : résident français, contrats courants ; clauses démembrées, exonérations historiques/fratrie/handicap hors calcul ; ventilation identique des bénéficiaires pour les deux fractions. Comparaison IR à TMI constante, sans liquidation globale des revenus mobiliers ou de la CSG déductible. Capital décès saisi après PS.
- Validation : 95 tests, build/types/lint et navigateur. Rachat 60 000 € sur 120 000 € dont 100 000 € de primes : net forfaitaire 57 875 €, ou 59 595 € avec solde PS nul. Deux enfants avec abattements personnels consommés, 200 000 € sous 757 B : droits 30 288 €, puis 33 338 € si 200 000 € d’autres bases partagent le plafond ; hors AV 36 388 €. Mobile contrôlé.
- Sources : https://www.impots.gouv.fr/particulier/questions/jai-effectue-des-retraits-sur-mon-contrat-dassurance-vie-quelles-sont-les ; https://www.impots.gouv.fr/particulier/lassurance-vie-et-le-pea-0 ; https://bofip.impots.gouv.fr/bofip/3456-PGP.html/identifiant=BOI-ENR-DMTG-10-10-20-20-20230330.

## Lot plus-values immobilières approfondi — 8 septembre 2026
- Calcul explicite par cédant physique : prix, frais réels et travaux communs proratisés ensemble ; seuil de 15 000 € sur la pleine propriété de sa quote-part. SCI : calcul au niveau de la société, sans diviser la surtaxe entre associés. Terrains à bâtir hors surtaxe, forfait travaux réservé au bâti après plus de cinq ans (y compris acquisition gratuite).
- Droits démembrés : prix fiscal d’acquisition et prix de vente propres au cédant saisis séparément, sans appliquer l’âge actuel au prix historique et sans double quote-part. Les frais réels du droit sont saisis directement. Cas historiques/réunion de droits expressément à déterminer depuis les actes.
- Non-résident : plafond unique de 150 000 € pour la seule quote-part simulée ; affiliation étrangère éligible à la seule solidarité de 7,5 % saisissable. Remploi calculé sur le prix net des frais admis de ce cédant, cession de droit démembré exclue du scénario.
- Abattement exceptionnel 150 VE : 60/75/85 %, confirmation des conditions, dates de promesse 2024–2027 et cession avant la fin de la deuxième année suivante. Retrait du 70 % automatique obsolète. Les engagements matériels restent à vérifier dans l’acte.
- Résultats invalidés dès modification. FAQ corrigée notamment sur la donation (nouvelle valeur et nouvelle date), la surtaxe, l’absence de durée d’un an garantissant la résidence principale et les dispenses de déclaration. Mise à jour des mentions 2026.
- Validation : 99 tests et build/types/lint ; navigateur quote-part 50 % (achat 100 000 €, frais 10 000 €, vente 200 000 €, frais 5 000 €) = PV 42 500 €, impôts 15 385 €, ou 11 262,50 € avec PS 7,5 % ; seuil de 15 000 €, invalidation/mobile ; droit acquis 60 000 €, vendu 90 000 €, frais 1 000/2 000 € = PV 27 000 €, impôts 9 774 €, identiques quel que soit l’âge indicatif saisi.
- Sources : BOI-RFPI-PVI-20-10-20-10 (https://bofip.impots.gouv.fr/bofip/309-PGP.html/identifiant=BOI-RFPI-PVI-20-10-20-10-20120912), BOI-RFPI-PVI-10-40-70 (https://bofip.impots.gouv.fr/bofip/4290-PGP.html/identifiant=BOI-RFPI-PVI-10-40-70-20140414), BOI-RFPI-TPVIE-20 (https://bofip.impots.gouv.fr/bofip/8597-PGP.html/identifiant=BOI-RFPI-TPVIE-20-20170308), BOI-RFPI-PVI-10-40-30 (https://bofip.impots.gouv.fr/bofip/7284-PGP.html/identifiant=BOI-RFPI-PVI-10-40-30-20210707), CGI 150 VE modifié par LF2026 art.54 ; https://www.impots.gouv.fr/international-particulier/questions/je-suis-non-resident-suis-je-redevable-des-contributions.

## Lot revenus fonciers approfondi — 8 septembre 2026
- Les deux régimes déduisent les mêmes charges réellement décaissées du solde financier. Le forfait fiscal de 20 € par local ne crée pas de décaissement. Assurance et frais d’emprunt suivent les intérêts dans l’ordre de détermination du déficit.
- Micro-foncier : éligibilité et absence d’option réelle irrévocable à confirmer, en plus du seuil de 15 000 €. FAQ corrigée : Pinel/Denormandie n’excluent pas à eux seuls le micro ; les parts de SCI/SCPI ne l’interdisent pas toujours. Aucun conseil automatique de prêt in fine.
- Déficit énergétique 2026–2027 : 10 700 € majorés des seuls travaux éligibles, au maximum 21 400 €, passage E/F/G vers A/B/C/D au 31/12/2027. Contrôle de cohérence du sous-montant de travaux.
- Reports fonciers antérieurs par millésime, utilisation des plus anciens d’abord, expiration après dix ans ; reports créés suivis dans la projection. Travaux décaissés seulement en première année ; suppression de la baisse arbitraire de 5 % des intérêts et de la multiplication d’un flux annuel variable par le nombre d’années.
- Limites affichées : loyers annuels représentés par leur moyenne mensuelle, charges nettes récupérables, TMI constante, revenu global suffisant supposé pour l’économie potentielle ; décote/CSG déductible et report de déficit global six ans non liquidés. Remboursement du capital, réductions locatives et nouveau bailleur privé hors calcul.
- Validation : 103 tests, build/types/lint, navigateur et mobile. Loyers 12 000 €, charges 2 000 € : soldes micro 6 035,20 € / réel 5 289,44 €. Loyers 15 000 €, intérêts 18 000 €, travaux 20 000 € dont 2 000 € énergétiques : imputation 12 700 €, report 10 320 € (forfait local 20 € compris).
- Sources : https://bofip.impots.gouv.fr/bofip/3973-PGP.html/identifiant=BOI-RFPI-DECLA-10-20250306 ; https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000054373682/2026-07-08 ; https://bofip.impots.gouv.fr/bofip/4142-PGP.html/identifiant=BOI-RFPI-BASE-30-20-20250916 ; https://bofip.impots.gouv.fr/bofip/5808-PGP.html/identifiant=BOI-RFPI-BASE-20-80-20170901.


## Lot location meublée — 109 tests

- Micro-BIC revenus 2026 : 83 600 €/50 % (classé et classique), 15 000 €/30 % non classé partout ; N-1 ou N-2, minimum 305 € plafonné aux recettes, conditions structure/option confirmées.
- Statut fiscal LMP distinct de l’affiliation sociale touristique >23 000 €. Suppression du forfait SSI 40 % ; cotisations et part déductible issues de l’estimation Urssaf, pas de double PS. Définition des autres revenus du foyer corrigée (pensions incluses).
- Trésorerie : charges communes identiques, frais comptables supplémentaires au réel, plafonnement article 39 C, stocks amortissements/déficits distincts. Pas de crédit fiscal fictif pour une perte. Solde déficitaire antérieur fourni après vérification des millésimes et expiration décennale.
- Amortissement : valeur terrain exclue, durées explicites modifiables, dotation théorique distincte de la déduction. Ancienne répartition n’amortissant que 85 % du bâti supprimée.
- Revente LMNP : dates révolues, frais et travaux admissibles, montant immobilier réellement déduit et réintégrable fourni, exceptions légales des résidences, surtaxe et PS immobiliers 17,2 % (ou solidarité 7,5 % si éligible). Suppression de la comparaison LMP qui calculait la mauvaise VNC et exonérait automatiquement après cinq ans de détention.
- Limites explicites : périmètre annuel, une catégorie sans activité mixte/para-hôtelière/usage privé, IR au TMI, pas d’imputation globale LMP, pas de projection 20 ans répétant à tort la première année. Cession professionnelle orientée vers son module, dont revue approfondie reste à terminer. Sauvegarde locale versionnée, impression/PDF.
- Validation : 109 tests, build/types/lint, parcours Chromium annuel/social/revente/invalidation/mobile sans erreur JS.
- Sources : CGI 50-0 version 01/07/2026 ; BOI-BAREME-000044-20260819 ; BOI-BIC-CHAMP-40-20-20260819 ; DGFiP régimes d’imposition, prélèvements sociaux et plus-values ; outil Urssaf économie collaborative. Liens détaillés dans l’onglet Règles et sources.


## Lot plus-values professionnelles — 115 tests

- Séparation actif professionnel IR / actif société IS / titres privés. VNC et frais de cession ; pas de CT fictif sur des titres privés détenus moins de deux ans.
- Durée d’activité distincte de détention. Exonérations soumises à confirmation des conditions complètes ; seuils 151 septies services90/126k ou ventes250/350k, 238 quindecies500k/1M avec valeur globale séparée. Immobilier exclu de238 et retraite151A.
- Cumuls compatibles B puis A puis151 ou238 ; jamais151+238 sur la même plus-value. Abattement B uniquementLT. PSLT maintenus sous151A ; cotisationsCT non annulées par exonération fiscale, montant explicite ou résultat signalé provisoire.
- Suppression de l’option barème fictive sur PV professionnelleLT. Titres privés : optionTMI limitéeexplicitement, abattement retraite500k solde restant, titres2ans et direction/participation5ans, PS sur totalité.
- IS calculé marginalement selon bénéfice déjà réalisé et tranche15% disponible, sinon25%. Net conservé dans société, distribution non incluse.
- Suppression des projections/suggestions qui assimilaient automatiquement attendre5ans à une exonération. Pas de recommandation de régime sans qualification du dossier.
- Limites : un actif homogène, pas de compensation multi-actifs/MV reportées, pas de crédit fiscal fictif sur pertes ; activités agricoles et cas internationaux/spéciaux hors périmètre ; IR auTMI ; cotisations issues d’estimation externe.
- Validation :115tests, build/types/lint ; ChromiumIR/conditions/IS/titresmoins2ans/mobile sans erreurJS. SourcesDGFiPjuin-août2026, SP F33162 (18,6%LT confirmé), BOFiP6156/6230/11406/3610, liens sur page.
