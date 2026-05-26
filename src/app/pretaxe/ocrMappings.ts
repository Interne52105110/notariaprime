// Mappings mots-clés OCR → (catégorie, acte) pour PretaxeCalculations.
// Le premier mot-clé de chaque liste est l'étiquette affichée à l'utilisateur.
// La détection retient la correspondance la PLUS LONGUE (cf. OCRScanner) :
// « donation-partage » l'emporte ainsi sur « donation ».

export const categoriesActes: Record<string, { actes: Record<string, string[]> }> = {
  biens_immobiliers: {
    actes: {
      vente_immeuble: ['vente d\'immeuble', 'vente immobilière', 'acte de vente', 'vente immeuble'],
      vente_terrain: ['vente de terrain à bâtir', 'vente de terrain', 'terrain à bâtir'],
      vefa: ['vente en l\'état futur d\'achèvement', 'état futur d\'achèvement', 'vefa', 'vente sur plan'],
      echange: ['échange d\'immeubles', 'échange immobilier', 'acte d\'échange'],
      licitation: ['licitation'],
      partage: ['partage successoral', 'acte de partage', 'partage de communauté', 'partage'],
      bail_construction: ['bail à construction', 'bail à réhabilitation'],
      servitude_proportionnel: ['constitution de servitude', 'servitude'],
    }
  },
  famille: {
    actes: {
      contrat_mariage: ['contrat de mariage'],
      changement_regime: ['changement de régime matrimonial', 'changement de régime'],
      pacs: ['pacte civil de solidarité', 'pacs'],
      divorce_consentement: ['divorce par consentement mutuel', 'convention de divorce'],
      liquidation_regime: ['liquidation du régime matrimonial', 'liquidation de régime'],
    }
  },
  successions: {
    actes: {
      donation_partage: ['donation-partage', 'donation partage'],
      donation: ['donation entre vifs', 'acte de donation', 'donation'],
      testament: ['testament authentique', 'testament'],
      notoriete: ['acte de notoriété', 'notoriété'],
      attestation_propriete: ['attestation de propriété', 'attestation immobilière', 'attestation après décès'],
      inventaire: ['inventaire successoral', 'procès-verbal d\'inventaire'],
      renonciation: ['renonciation à la succession', 'renonciation à succession'],
      declaration_succession: ['déclaration de succession'],
    }
  },
  prets: {
    actes: {
      pret_hypothecaire: ['prêt avec hypothèque', 'prêt hypothécaire', 'crédit hypothécaire', 'affectation hypothécaire', 'ouverture de crédit'],
      pret_viager: ['prêt viager hypothécaire', 'prêt viager'],
      mainlevee_saisie: ['mainlevée de saisie'],
      mainlevee_hypo_inf: ['mainlevée d\'hypothèque', 'mainlevée hypothécaire'],
      caution_hypothecaire: ['cautionnement hypothécaire', 'caution hypothécaire', 'cautionnement réel'],
      ppd: ['privilège de prêteur de deniers', 'privilège de preteur de deniers', 'ppd'],
    }
  },
  societes: {
    actes: {
      // Constitution AVEC apport immobilier (tarifé A444-158). Sans immeuble,
      // c'est statuts_societe_simple (honoraires libres) ci-dessous.
      constitution_societe: ['apport immobilier à la société', 'apport d\'immeuble à la société'],
      augmentation_capital: ['augmentation de capital'],
      cession_parts: ['cession de parts sociales', 'cession de parts'],
      dissolution: ['dissolution de société', 'dissolution-liquidation'],
      transformation: ['transformation de société'],
    }
  },
  divers: {
    actes: {
      procuration: ['procuration authentique', 'procuration'],
      quittance: ['quittance'],
      consentement_adoption: ['consentement à adoption', 'consentement à l\'adoption'],
    }
  },
  actes_non_tarifies: {
    actes: {
      statuts_societe_simple: ['statuts de société', 'constitution de société', 'constitution de sci', 'création de société', 'statuts'],
      statuts_societe_complexe: ['statuts de sas', 'statuts de holding'],
      bail_commercial: ['bail commercial', 'bail 3 6 9', 'bail dérogatoire'],
      bail_professionnel: ['bail professionnel'],
      commodat: ['commodat', 'prêt à usage'],
      promesse_vente: ['promesse unilatérale de vente', 'promesse de vente', 'compromis de vente', 'compromis'],
      convention_indivision: ['convention d\'indivision'],
      vente_fonds_commerce: ['vente de fonds de commerce', 'cession de fonds de commerce', 'fonds de commerce'],
      pacte_actionnaires: ['pacte d\'actionnaires', 'pacte d\'associés'],
      mandat_vente: ['mandat de vente', 'mandat de recherche', 'mandat exclusif'],
      transaction_mediation: ['protocole transactionnel', 'transaction (article 2044)'],
      consultation: ['consultation juridique'],
      pacte_tontine: ['pacte tontinier', 'clause de tontine', 'tontine'],
    }
  },
};
