/** Historique des changements livrés, partagé par l'accueil et la roadmap. */
export const releases = [
  {
    id: 'aide-calculateurs-2026-09-17', date: '2026-09-17', dateLabel: '17 septembre 2026',
    title: 'Des explications pour chaque calculateur',
    summary: 'Les 19 outils disposent désormais d’une méthode de saisie, d’exemples commentés et de réponses aux questions fréquentes, avec des sources et des liens adaptés au dossier.',
    changes: [
      'Aides dédiées à chaque outil : données à préparer, lecture du résultat et limites du calcul.',
      '21 exemples commentés, dont trois cas de prétaxe : vente, prêt et donation avec apports inégaux.',
      'FAQ réécrites et accessibles directement sur les pages ; les réponses restent présentes même lorsque les accordéons sont repliés.',
      'Annuaire complété, comparaison location en direct/SCI clarifiée et parcours assurance-vie, statuts et investissement locatif réorganisés.',
    ],
    limit: 'Les exemples utilisent des hypothèses fixes. Ils expliquent les résultats sans remplacer les pièces et la qualification propres à chaque dossier.',
    links: [{ label: 'Parcourir les 19 simulateurs', href: '/features' }, { label: 'Voir les exemples de prétaxe', href: '/pretaxe#outil-exemples' }],
    source: 'https://github.com/Interne52105110/notariaprime/blob/main/docs/calculator-help-2026-09-17.md',
  },
  {
    id: 'pretaxe-2026-09-17', date: '2026-09-17', dateLabel: '17 septembre 2026',
    title: 'Une prétaxe plus détaillée',
    summary: 'Donations par donateur, frais en quantité et PDF détaillé : les premiers enseignements du rapprochement avec des prétaxes professionnelles sont intégrés.',
    changes: [
      'Donations : un ou plusieurs donateurs, apports différents, plusieurs biens et réserve d’usufruit. Les émoluments sont calculés séparément pour chaque donateur.',
      'Tarifs distincts pour les prêts professionnels, certaines donations mobilières et les partages de biens indivis ; assiettes de TPF et de CSI indépendantes pour les sûretés.',
      'Formalités et copies détaillées en quantité, frais présumés retirés, écrêtement et TVA nette visibles dans le récapitulatif et le PDF.',
      'Scan et texte : propositions à vérifier avant de remplir un nouveau dossier, centimes conservés et informations manquantes signalées.',
    ],
    limit: 'Sans les actes d’origine, la qualification complète des situations et la nécessité de chaque prestation ne peuvent pas être déduites des seules prétaxes. Les droits fiscaux de donation restent à compléter séparément.',
    links: [{ label: 'Ouvrir la prétaxe', href: '/pretaxe' }],
    source: 'https://github.com/Interne52105110/notariaprime/pull/6',
  },
  {
    id: 'simulateurs-2026-09-14', date: '2026-09-14', dateLabel: '14 septembre 2026',
    title: 'Des calculs revus et de nouveaux outils immobiliers',
    summary: 'Trois outils de préparation d’un projet immobilier et douze guides complètent la revue des calculs et de leurs hypothèses.',
    changes: [
      'Ajout de la capacité d’emprunt et du budget immobilier, de la comparaison achat/location/revente et du simulateur Relance logement.',
      'Publication de douze guides avec exemples, hypothèses, pièces à réunir et références.',
      'Revue des assiettes fiscales, de la distinction entre impôts et frais d’actes, des flux de trésorerie et des conditions des régimes particuliers.',
      'Mode foyer facultatif dans plusieurs simulateurs immobiliers pour estimer la variation d’impôt sur le revenu.',
    ],
    limit: 'Chaque simulateur précise son périmètre. Les cas particuliers et les projections nécessitent de vérifier les hypothèses du dossier.',
    links: [
      { label: 'Budget immobilier', href: '/capacite-emprunt' },
      { label: 'Direct ou SCI IS', href: '/strategie-immobiliere' },
      { label: 'Relance logement', href: '/relance-logement' },
      { label: 'Les guides', href: '/guides' },
    ],
    source: 'https://github.com/Interne52105110/notariaprime/pull/5',
  },
] as const;
