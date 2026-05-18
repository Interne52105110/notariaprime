// Mappings mots-clés OCR → (catégorie, acte) pour PretaxeCalculations
// L'ordre des mots-clés compte : le premier est l'étiquette affichée à l'utilisateur.

export const categoriesActes: Record<string, { actes: Record<string, string[]> }> = {
  biens_immobiliers: {
    actes: {
      vente_immeuble: ['vente immeuble', 'vente d\'immeuble', 'acte de vente', 'compromis de vente', 'vente immobilière'],
      vente_terrain: ['vente terrain', 'vente de terrain', 'terrain à bâtir'],
      vefa: ['vente en l\'état futur d\'achèvement', 'vefa', 'vente sur plan'],
      echange: ['échange immobilier', 'acte d\'échange'],
      licitation: ['licitation'],
      partage: ['partage successoral', 'acte de partage'],
      bail_construction: ['bail à construction'],
      servitude_fixe: ['servitude'],
    }
  },
  famille: {
    actes: {
      contrat_mariage: ['contrat de mariage'],
      changement_regime: ['changement de régime matrimonial'],
      pacs: ['pacs', 'pacte civil de solidarité'],
      divorce_consentement: ['divorce par consentement mutuel'],
      liquidation_regime: ['liquidation du régime'],
    }
  },
  successions: {
    actes: {
      donation: ['donation', 'acte de donation'],
      donation_partage: ['donation-partage', 'donation partage'],
      testament: ['testament authentique', 'testament'],
      notoriete: ['acte de notoriété', 'notoriété'],
      attestation_propriete: ['attestation de propriété', 'attestation immobilière'],
      inventaire: ['inventaire successoral'],
      renonciation: ['renonciation à succession'],
      declaration_succession: ['déclaration de succession'],
    }
  },
  prets: {
    actes: {
      pret_hypothecaire: ['prêt hypothécaire', 'pret hypothecaire', 'crédit hypothécaire'],
      pret_viager: ['prêt viager hypothécaire', 'pret viager'],
      mainlevee_saisie: ['mainlevée de saisie'],
      mainlevee_hypo_inf: ['mainlevée d\'hypothèque'],
      caution_hypothecaire: ['caution hypothécaire'],
      ppd: ['privilège de prêteur de deniers', 'ppd'],
    }
  },
  societes: {
    actes: {
      constitution_societe: ['constitution de société', 'statuts'],
      augmentation_capital: ['augmentation de capital'],
      cession_parts: ['cession de parts'],
      dissolution: ['dissolution de société'],
      transformation: ['transformation de société'],
    }
  },
  divers: {
    actes: {
      procuration: ['procuration'],
      quittance: ['quittance'],
      consentement_adoption: ['consentement à adoption'],
    }
  },
};
