# Prétaxe : corrections issues de l’audit du 17 septembre 2026

Le rapprochement avec 237 PDF professionnels a porté sur les lignes chiffrées lisibles. Les actes d’origine ne sont pas disponibles : les prestations effectivement nécessaires, les droits transmis et les régimes fiscaux ne peuvent donc pas être entièrement reconstitués. Les documents clients et leurs noms ne sont pas publiés dans ce dépôt.

## Corrections

- Émoluments calculés en décimal, avec arrondi préalable de l’assiette à l’euro. Les tests conservent cinq écarts d’un centime avec les références professionnelles, sans adapter artificiellement la règle pour les effacer.
- Tarifs distincts pour le prêt destiné à une activité professionnelle, la donation relevant du 4° d’A444-67 et le partage de biens indivis relevant d’A444-122.
- Donations : apports regroupés par donateur ; barème appliqué séparément à chaque donateur. Aucune hypothèse de répartition entre époux. La réserve d’usufruit conserve l’assiette des émoluments en pleine propriété. Les attributions aux enfants sont descriptives ; les droits fiscaux restent à liquider séparément.
- Assiettes distinctes de TPF et de CSI pour une sûreté. Une inscription supplémentaire ne se déduit pas automatiquement du seul montant du prêt.
- Formalités en quantité, copies et archivage selon les tarifs par page. Pas de copies, pages d’acte, diagnostics, notifications, mentions en marge ou débours présumés à partir du seul type d’acte. Pour une donation, sélectionner aussi les formalités de publication lorsqu’elles sont applicables.
- Écrêtement calculé sur les émoluments d’acte, formalités et copies concernés ; déduction explicite dans le récapitulatif et le PDF. TVA arrondie sur le total HT net. CSI classée avec le Trésor public.
- Extraction PDF, image et texte : propositions à vérifier avant remplacement du dossier, centimes conservés, absence de prix ou département signalée, pas de montant médian de secours. L’adresse de l’étude ne détermine plus le département du bien. Le mode IA locale reste facultatif.

## Validation

432 tests automatisés, dont 248 comparaisons de lignes d’actes et 15 écrêtements. Parmi les 248 lignes, 243 correspondent exactement au montant professionnel et 5 gardent un résidu de 0,01 €. Ces comparaisons portent sur des assiettes et qualifications explicites ; elles ne prouvent pas la complétude des prétaxes.

Essais navigateur : donation-partage à deux donateurs et apports inégaux, réserve d’usufruit, prêt professionnel avec bases TPF/CSI différentes, formalités en quantité, extraction de texte avec validation explicite et département manquant, export PDF. Le PDF est rendu et contrôlé visuellement. Le mode Ollama n’est pas validé sur des actes d’origine.

## Principales références officielles

- [A444-54 : assiettes arrondies](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032132062)
- [A444-67 : donations](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684286) et [A444-68 : donation-partage](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684289)
- [A444-139 : prêts professionnels](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684511)
- [A444-122 : partage de biens indivis](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684467)
- [A444-171 : formalités](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684637), [A444-172](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045252562), [A444-172-1 : diagnostics](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684657), [A444-173 : copies et autres formalités](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041684666)
- [A444-175 : écrêtement](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032133012) et [R444-9](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034734293)
