export interface ToolHelp {
  title: string;
  intro: string;
  steps: [string, string][];
  examples: { title: string; context: string; rows: [string, string][]; conclusion: string }[];
  faq: [string, string][];
  sources: [string, string][];
  related: [string, string][];
}

const impots = 'https://www.impots.gouv.fr/particulier/';
const sci = impots + 'societe-civile-immobiliere';
const pv = impots + 'plus-values-imposees';
const credit = 'https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers';

/** Aide éditoriale : exemples bornés, indépendants des valeurs saisies par le visiteur. */
export const toolHelp: Record<string, ToolHelp> = {
  '/pretaxe': {
    title: 'Préparer et comprendre une prétaxe',
    intro: 'Une prétaxe estime les lignes de frais d’un acte avant sa taxation définitive. Pour expliquer un écart, comparez les prestations, leurs bases et leurs quantités plutôt qu’un pourcentage global.',
    steps: [
      ['Choisir l’acte et le mode de saisie', 'En manuel, partez de l’opération juridique et renseignez les champs correspondants. À partir d’un texte ou d’un scan, relisez la proposition avant de l’appliquer : une extraction ne confirme ni la qualification de l’acte ni les prestations nécessaires.'],
      ['Documenter les assiettes', 'Le prix, le montant garanti et les bases fiscales peuvent différer. Pour une donation, attribuez chaque contribution au bon donateur ; pour une réserve d’usufruit, renseignez la pleine propriété et le droit transmis selon les champs proposés.'],
      ['Composer les frais du dossier', 'Les émoluments rémunèrent l’acte, les formalités correspondent à des prestations tarifées, les taxes sont reversées au Trésor et les débours remboursent des dépenses. Vérifiez les quantités, la TVA et l’éventuel écrêtement. Un montant absent n’est pas nécessairement nul.'],
    ],
    examples: [
      { title: 'Vente : isoler la rémunération de l’acte', context: 'Vente ordinaire de 300 000 €, sans remise ni majoration. Illustration de l’émolument seul.', rows: [['Émolument HT', '2 794,25 €'], ['TVA à 20 %', '558,85 €'], ['Émolument TTC', '3 353,10 €']], conclusion: 'Ajoutez les droits de mutation, la publicité foncière, les formalités, les débours et les autres actes nécessaires pour préparer la provision.' },
      { title: 'Prêt : conserver des bases distinctes', context: 'Prêt de 600 000 € ; le dossier justifie une base TPF de 216 000 € et une base CSI de 720 000 €. Ces bases sont illustratives.', rows: [['Base des émoluments du prêt', '600 000 €'], ['Base à renseigner pour la TPF', '216 000 €'], ['Base à renseigner pour la CSI', '720 000 €']], conclusion: 'Le montant du prêt ne permet pas à lui seul de déduire la base de chaque taxe. Reprenez les garanties et accessoires de l’acte.' },
      { title: 'Donation : deux contributions inégales', context: 'Madame donne des biens de 200 000 € et Monsieur des biens de 100 000 €, valeurs en pleine propriété.', rows: [['Donatrice : contributions à regrouper', '200 000 €'], ['Donateur : contributions à regrouper', '100 000 €'], ['Valeur totale des biens', '300 000 €']], conclusion: 'Le barème d’émoluments s’applique séparément à chaque donateur. La valeur totale ne justifie pas une répartition moitié/moitié ; les droits fiscaux par bénéficiaire restent à traiter séparément.' },
    ],
    faq: [
      ['Le total est-il une provision définitive ?', 'Non. Il porte sur les lignes renseignées. Des formalités, débours ou actes complémentaires peuvent rester à chiffrer. Le décompte définitif dépend du dossier et des prestations effectivement réalisées.'],
      ['Puis-je faire confiance au texte reconnu par OCR ?', 'Contrôlez les montants, dates, personnes, droits transmis et quantités. Une page illisible ou une information absente peut laisser un champ incomplet. L’application de la proposition intervient après votre vérification.'],
      ['Un seul parent donne : faut-il créer deux donateurs ?', 'Non. Créez uniquement les donateurs qui interviennent et leurs contributions réelles. Pour plusieurs biens du même donateur, conservez le même rattachement.'],
      ['La donation en nue-propriété réduit-elle toutes les lignes ?', 'Non. Assiette des émoluments, valeur fiscale des droits transmis et publicité foncière répondent à des règles différentes. Le module distingue les données ; ne réduisez pas toutes les bases avec le même pourcentage.'],
    ],
    sources: [['https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032132058', 'Code de commerce — tarifs des notaires'], ['https://www.impots.gouv.fr/droits-denregistrement', 'DGFiP — droits d’enregistrement et taux départementaux']],
    related: [['/donation', 'Calculer les droits de donation'], ['/succession', 'Calculer les droits de succession']],
  },
  '/succession': {
    title: 'Passer de la part héritée aux droits à payer',
    intro: 'Ce calculateur estime l’impôt dû par une personne. Préparez sa part nette avant d’appliquer les abattements et le barème ; le patrimoine total du défunt n’est pas toujours cette part.',
    steps: [
      ['Établir les parts civiles', 'La propriété des biens, le régime matrimonial, les dettes admises et les droits des héritiers se déterminent en amont. L’outil ne répartit pas automatiquement une succession entre les membres de la famille.'],
      ['Renseigner l’historique fiscal', 'Indiquez le lien de parenté, les abattements déjà utilisés et les bases taxables rappelables. En représentation, vérifiez le partage de l’abattement de la souche et les donations concernant la personne simulée.'],
      ['Lire les droits et les frais séparément', 'Le résultat fiscal se rapporte à l’héritier ou au légataire renseigné. Les frais de notoriété, de déclaration ou d’attestation immobilière relèvent de la prétaxe des actes.'],
    ],
    examples: [{ title: 'Un enfant reçoit une part nette de 200 000 €', context: 'Pleine propriété, aucun rappel de donation, abattement intact, sans autre exonération.', rows: [['Part nette', '200 000 €'], ['Abattement', '100 000 €'], ['Base taxable', '100 000 €'], ['Droits arrondis à l’euro', '18 194 €']], conclusion: 'Il s’agit des droits de cet enfant, hors frais d’actes. Recommencez avec les données propres à chaque autre héritier.' }],
    faq: [
      ['Dois-je saisir le patrimoine total ?', 'Saisissez la part nette revenant à la personne calculée. Le patrimoine total doit d’abord être ventilé selon la propriété, les dettes et les droits civils.'],
      ['Une donation antérieure est-elle taxée une deuxième fois ?', 'Le rappel peut modifier l’abattement disponible et les tranches applicables à la nouvelle transmission. Renseigner l’historique sert à calculer les droits supplémentaires, pas à payer à nouveau les mêmes droits.'],
      ['Conjoint et partenaire de PACS sont-ils traités comme des enfants ?', 'Non. Le conjoint survivant et le partenaire de PACS sont exonérés de droits de succession. Le partenaire doit toutefois avoir des droits civils à recevoir, notamment par testament : l’exonération ne le rend pas héritier.'],
      ['Où saisir une assurance-vie ?', 'Utilisez le module assurance-vie avec le certificat fiscal de l’assureur. Certains montants nécessitent ensuite une articulation avec les abattements et bases successorales déjà utilisés.'],
    ],
    sources: [[impots + 'questions/comment-dois-je-calculer-les-droits-de-succession', 'DGFiP — calcul des droits de succession']],
    related: [['/pretaxe', 'Estimer les frais des actes'], ['/assurance-vie', 'Examiner la transmission d’une assurance-vie']],
  },
  '/sci': {
    title: 'Comprendre résultat fiscal et trésorerie d’une SCI',
    intro: 'Comparez une même année avec les mêmes loyers et dépenses. L’impôt de la société, le solde de son compte bancaire et le revenu reçu par l’associé sont trois résultats différents.',
    steps: [
      ['Préparer l’exploitation', 'Renseignez les loyers et charges annuels. L’échéancier bancaire permet de séparer intérêts et remboursement du capital. Les charges fiscales supplémentaires ne doivent pas reprendre une dépense déjà saisie.'],
      ['Distinguer IR et IS', 'À l’IR, le résultat foncier est attribué aux associés selon leurs droits. À l’IS, l’amortissement renseigné intervient dans le résultat de la société ; la distribution éventuelle est une étape distincte.'],
      ['Suivre les comptes courants et la sortie', 'Les intérêts versés à un associé ne sont pas un remboursement de son avance. Vérifiez leur montant déductible et la distribution. Pour décider sur plusieurs années, examinez aussi la revente et le retour des fonds.'],
    ],
    examples: [{ title: 'Une année sans emprunt ni distribution', context: '15 000 € de loyers, 3 000 € de charges, aucun intérêt ni CCA. TMI 30 %, charges fiscales IR supplémentaires nulles ; IS au taux de 25 %, amortissement de 5 000 €.', rows: [['Base à l’IR', '12 000 €'], ['IR et prélèvements sociaux', '5 664 €'], ['Trésorerie après fiscalité à l’IR', '6 336 €'], ['Base à l’IS', '7 000 €'], ['IS', '1 750 €'], ['Trésorerie conservée dans la SCI à l’IS', '10 250 €']], conclusion: 'Sans distribution, l’associé ne reçoit pas les 10 250 €. Cet exemple annuel n’intègre pas la fiscalité de la vente ni des frais supplémentaires propres à chaque structure.' }],
    faq: [
      ['Pourquoi mon emprunt ne réduit-il pas tout le bénéfice ?', 'L’échéance comprend des intérêts et du capital. Le remboursement du capital consomme de la trésorerie mais ne constitue pas une charge fiscale déductible.'],
      ['L’amortissement est-il une somme à payer ?', 'Non. C’est une charge comptable répartissant une valeur amortissable. Dans le scénario IS, elle peut diminuer le résultat sans décaissement de même montant cette année-là.'],
      ['Puis-je retirer toute la trésorerie comme dividende ?', 'Le solde bancaire ne suffit pas à déterminer un bénéfice distribuable. L’outil borne la distribution dans son scénario ; les comptes, décisions sociales et droits des associés restent à vérifier.'],
      ['L’IS est-il toujours préférable ?', 'Une économie annuelle ne suffit pas pour choisir. Comparez aussi les frais de structure, la distribution, la vente et la situation des associés sur une durée cohérente.'],
    ],
    sources: [[sci, 'DGFiP — SCI'], ['https://entreprendre.service-public.gouv.fr/vosdroits/F23575', 'Service Public — impôt sur les sociétés']],
    related: [['/strategie-immobiliere', 'Comparer la détention jusqu’à la vente'], ['/revenus-fonciers', 'Détailler les revenus fonciers']],
  },
  '/lmnp': {
    title: 'Comparer la location meublée à l’année et à la revente',
    intro: 'Préparez les recettes, les charges et les amortissements avant de comparer les régimes. L’avantage fiscal annuel doit être rapproché de la trésorerie et des conséquences de la cession.',
    steps: [
      ['Qualifier l’activité', 'Distinguez les recettes de cette location, celles du foyer et les autres revenus pertinents. Vérifiez la nature de la location et les conditions du régime micro proposé. La qualification fiscale ne suffit pas à déterminer les cotisations sociales.'],
      ['Préparer le réel', 'Utilisez les charges justifiées et le plan d’amortissement. Séparez le déficit et les amortissements reportés ; ces deux reports ne sont pas interchangeables. Renseignez le coût de comptabilité une seule fois.'],
      ['Ajouter la vente à la comparaison', 'L’onglet de revente demande les amortissements effectivement déduits et réintégrables. Une valeur théorique d’amortissement ou le seul cumul des loyers ne remplace pas le décompte comptable.'],
    ],
    examples: [{ title: 'Reconstituer une base annuelle au réel', context: 'Aucun déficit antérieur, aucun intérêt ; amortissement admissible de 5 000 € et coût comptable séparé.', rows: [['Recettes', '12 000 €'], ['Charges', '− 2 000 €'], ['Comptabilité', '− 600 €'], ['Amortissement déductible', '− 5 000 €'], ['Base avant impôts et prélèvements', '4 400 €']], conclusion: 'Les 5 000 € d’amortissement ne sont pas une sortie bancaire de l’année. La fiscalité et la trésorerie dépendent aussi des autres données du formulaire.' }],
    faq: [
      ['Micro et réel : faut-il comparer les mêmes dépenses ?', 'Oui. Même lorsque le micro ne déduit pas les charges réelles pour calculer la base fiscale, ces dépenses réduisent votre argent disponible. Conservez des hypothèses économiques identiques.'],
      ['Puis-je déduire tous les amortissements calculés ?', 'Pas nécessairement. L’outil applique un plafonnement dans son périmètre et distingue les reports. Reprenez le plan comptable et les amortissements réellement admis.'],
      ['LMNP signifie-t-il absence de cotisations sociales ?', 'Non. La qualification fiscale LMNP/LMP et les règles d’affiliation sociale sont distinctes. Utilisez les données correspondant à votre activité et vérifiez les situations particulières.'],
      ['Pourquoi renseigner les amortissements à la vente ?', 'Les règles de cession peuvent faire intervenir certains amortissements antérieurement déduits. Le module demande leur montant réintégrable ; les exceptions doivent être justifiées.'],
    ],
    sources: [[impots + 'location-meublee', 'DGFiP — location meublée'], [impots + 'questions/je-vends-un-bien-immobilier-donne-en-location-meublee-comment-se-calcule-la', 'DGFiP — vente d’un logement meublé'], ['https://mon-entreprise.urssaf.fr/assistants', 'Urssaf — assistants, dont location meublée et régime social']],
    related: [['/plusvalue-pro', 'Examiner une cession professionnelle'], ['/revenus-fonciers', 'Étudier une location nue']],
  },
  '/capacite-emprunt': {
    title: 'Transformer une mensualité disponible en budget d’achat',
    intro: 'La capacité d’emprunt dépend de vos revenus retenus, des crédits existants, du taux, de la durée et de l’assurance. Le budget du bien tient ensuite compte de l’apport et des frais.',
    steps: [
      ['Préparer les montants mensuels', 'Utilisez une période identique pour revenus et mensualités de crédits. Les revenus variables ou locatifs peuvent être retenus différemment par la banque : le simulateur n’évalue pas leur stabilité.'],
      ['Réserver la place de l’assurance', 'La mensualité disponible inclut ici l’assurance calculée sur le capital initial. Augmenter le taux d’assurance réduit donc le capital finançable à mensualité identique.'],
      ['Passer au prix du bien', 'L’apport augmente les ressources ; les frais de crédit et d’acquisition les consomment. Le reste avant dépenses courantes n’est pas un budget de vie complet.'],
    ],
    examples: [{ title: 'Du revenu à la mensualité', context: 'Revenus retenus de 4 000 € par mois, effort de 35 %, autres crédits de 200 € par mois.', rows: [['Enveloppe mensuelle totale : 4 000 × 35 %', '1 400 €'], ['Crédits existants', '− 200 €'], ['Disponible pour le nouveau prêt, assurance comprise', '1 200 €']], conclusion: 'Le taux et la durée convertissent ensuite ces 1 200 € en capital. Ce montant ne constitue pas un accord bancaire.' }],
    faq: [
      ['35 % donne-t-il un droit au crédit ?', 'Non. C’est un repère réglementaire usuel intégré à la simulation. La banque examine aussi le reste à vivre, les revenus, les garanties et ses critères d’octroi.'],
      ['L’apport augmente-t-il la mensualité disponible ?', 'Non. Il augmente les ressources pour l’achat. Les revenus et charges de crédit déterminent la mensualité disponible dans ce modèle.'],
      ['Le budget affiché comprend-il les frais ?', 'Le prix du bien est calculé après réservation des frais renseignés. Vérifiez le pourcentage de frais d’achat et les frais de crédit, puis détaillez les frais d’actes dans la prétaxe.'],
    ],
    sources: [[credit, 'HCSF — conditions d’octroi des crédits immobiliers']],
    related: [['/pret', 'Voir l’échéancier et le coût du prêt'], ['/pretaxe', 'Détailler les frais d’acquisition']],
  },
  '/plusvalue-pro': {
    title: 'Identifier la cession avant de calculer la plus-value',
    intro: 'Vendre un actif de l’entreprise et vendre personnellement ses titres ne relèvent pas du même calcul. Commencez par identifier le vendeur, le bien cédé et le régime fiscal.',
    steps: [
      ['Choisir le bon parcours', 'Sélectionnez cession d’actif à l’IR, à l’IS ou cession privée de titres selon l’opération. Une vente immobilière privée ordinaire dispose de son propre calculateur.'],
      ['Reconstituer la valeur de référence', 'Pour un actif amorti, partez de la valeur d’origine et des amortissements pour obtenir la valeur nette comptable. Les prix et frais doivent concerner le même actif et le même périmètre.'],
      ['Examiner les exonérations', 'Ne confirmez un dispositif qu’après vérification de ses conditions : activité, durée, recettes ou valeur transmise selon le régime. Les compensations entre plusieurs actifs ne sont pas reconstituées automatiquement.'],
    ],
    examples: [{ title: 'Vente d’un actif amorti', context: 'Actif acquis 100 000 €, amortissements de 40 000 €, prix de cession 80 000 €, sans frais.', rows: [['Valeur nette comptable : 100 000 − 40 000', '60 000 €'], ['Prix de cession', '80 000 €'], ['Plus-value avant exonérations', '20 000 €']], conclusion: 'La vente est inférieure au coût d’origine tout en générant une plus-value comptable. L’impôt dépend ensuite du régime sélectionné.' }],
    faq: [
      ['Puis-je utiliser ce calcul pour vendre mes actions ?', 'Le parcours de cession privée de titres est distinct de celui des actifs professionnels. Vérifiez que la nature des titres et les options proposées correspondent à votre opération.'],
      ['Une case d’exonération confirme-t-elle mon éligibilité ?', 'Non. Elle exprime une hypothèse du dossier. Le résultat suppose que les conditions du dispositif sont effectivement satisfaites.'],
      ['Le résultat correspond-il à l’argent reçu personnellement ?', 'Pas toujours. Une société peut encaisser le prix et payer son impôt, puis distribuer des fonds dans un second temps. La fiscalité de cette distribution est une opération distincte.'],
    ],
    sources: [['https://entreprendre.service-public.gouv.fr/vosdroits/F33162', 'Service Public — plus-values professionnelles'], ['https://entreprendre.service-public.gouv.fr/vosdroits/F36021', 'Service Public — cession d’actions de SAS']],
    related: [['/plusvalue', 'Calculer une plus-value immobilière privée'], ['/sci', 'Examiner la cession dans une SCI']],
  },
  '/retraite': {
    title: 'Préparer une projection à partir de votre relevé',
    intro: 'La projection part des droits que vous renseignez. Le relevé de carrière et les estimations des caisses permettent de vérifier les trimestres, les régimes et les points avant de comparer des dates de départ.',
    steps: [
      ['Vérifier les droits acquis', 'Consultez votre relevé sur Info Retraite. Distinguez la durée tous régimes de celle du régime calculé. Reprenez les points acquis et la base de pension adaptée au statut ; le dernier salaire ne remplace pas systématiquement cette base.'],
      ['Définir la carrière future', 'Les trimestres et points futurs sont des hypothèses. Comparez plusieurs départs avec les mêmes droits de départ et vérifiez les cas de carrière mixte, interruption ou dispositif particulier auprès des caisses.'],
      ['Lire le brut et le net', 'Les prélèvements sociaux renseignés modifient le net présenté. Celui-ci est distinct du montant après impôt sur le revenu. Les paramètres monétaires sont conservés constants dans la projection.'],
    ],
    examples: [{ title: 'Comprendre la pension de base d’un salarié', context: 'Exemple de formule : salaire annuel moyen retenu de 30 000 €, taux plein de 50 %, durée du régime égale à la durée requise, sans surcote.', rows: [['Pension de base annuelle : 30 000 × 50 % × 1', '15 000 €'], ['Pension de base mensuelle brute', '1 250 €']], conclusion: 'Ajoutez la retraite complémentaire, puis les prélèvements applicables. Cet exemple n’établit ni votre date de départ ni votre droit au taux plein.' }],
    faq: [
      ['Où trouver les trimestres et les points ?', 'Le compte Info Retraite réunit les informations de carrière et les régimes concernés. Rapprochez les montants des relevés de chaque caisse lorsque votre carrière comporte plusieurs affiliations.'],
      ['Taux plein signifie-t-il pension maximale ?', 'Non. La durée retenue dans le régime et la rémunération de référence influencent aussi le montant. Une pension sans décote peut rester proratisée.'],
      ['Le simulateur corrige-t-il mon relevé ?', 'Non. Il calcule à partir des informations saisies. Une période manquante doit être examinée avec le service compétent avant d’utiliser une projection pour décider d’un départ.'],
      ['Les paramètres futurs sont-ils garantis ?', 'Non. L’évolution des règles, des points et des rémunérations n’est pas prédite. Utilisez la projection pour comparer des hypothèses puis vérifiez votre estimation officielle.'],
    ],
    sources: [['https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/voir-ma-carriere.html', 'Info Retraite — consulter sa carrière'], ['https://www.service-public.gouv.fr/particuliers/actualites/A18792', 'Service Public — estimation officielle de retraite'], ['https://www.service-public.gouv.fr/particuliers/vosdroits/F21552', 'Service Public — montant de la pension de base']],
    related: [['/assurance-vie', 'Examiner un complément d’épargne']],
  },
  '/strategie-immobiliere': {
    title: 'Comparer location nue en direct et SCI à l’IS',
    intro: 'Le comparateur suit l’achat d’un bien locatif, son exploitation et sa vente. Il compare deux modes de détention ; il ne compare pas le fait de louer sa résidence principale avec celui de l’acheter.',
    steps: [
      ['Conserver le même projet', 'Utilisez le même prix, financement, loyer, charges et prix de vente. Les coûts de comptabilité de la SCI et l’amortissement du bâti doivent être renseignés séparément.'],
      ['Lire les flux annuels', 'Séparez impôts, principal remboursé et argent disponible. Les avances supplémentaires nécessaires en SCI alimentent le compte courant dans le modèle. Les fonds restent en société jusqu’à la sortie simulée.'],
      ['Comparer le retour personnel à la vente', 'Le prix de vente sert notamment à payer le prêt restant et l’impôt de cession. En SCI, le remboursement du compte courant précède la distribution simulée ; un solde peut rester en société.'],
    ],
    examples: [{ title: 'Lire le budget de départ et la dette', context: 'Achat de 200 000 €, frais de 15 000 €, crédit de 180 000 €. Illustration des flux, avant impôts.', rows: [['Coût d’entrée', '215 000 €'], ['Crédit', '− 180 000 €'], ['Apport initial', '35 000 €'], ['Si 10 000 € de capital sont remboursés ensuite', 'Dette ramenée à 170 000 €']], conclusion: 'Le remboursement de 10 000 € consomme autant de trésorerie. Il ne diminue pas le résultat fiscal de 10 000 € ; consultez ensuite les tableaux annuels et la sortie finale.' }],
    faq: [
      ['Est-ce une comparaison acheter ou rester locataire ?', 'Non. Les deux scénarios supposent l’acquisition d’un bien destiné à la location nue : en direct ou en SCI à l’IS.'],
      ['Le prix de revente est-il une prévision ?', 'Non. C’est votre hypothèse. Faites varier ce prix et la durée pour voir si l’écart entre les scénarios reste significatif.'],
      ['Les règles fiscales changent-elles pendant la projection ?', 'Le modèle conserve les paramètres fiscaux 2026 sur tout l’horizon. Il ne prédit pas les réformes futures ni toutes les conséquences d’une liquidation de société.'],
    ],
    sources: [[sci, 'DGFiP — SCI'], [pv, 'DGFiP — plus-values immobilières']],
    related: [['/sci', 'Détailler une année de SCI'], ['/capacite-emprunt', 'Préparer le financement']],
  },
  '/relance-logement': {
    title: 'Préparer les conditions et le calcul annuel',
    intro: 'L’outil chiffre un amortissement dans les cas proposés après confirmation des conditions. Il faut d’abord qualifier le logement, les travaux, les dates et la location envisagée.',
    steps: [
      ['Vérifier le dossier', 'Rassemblez l’acte, les dates d’acquisition et de début, la nature du logement et les justificatifs de travaux. Le parcours ancien est limité au cas de réhabilitation lourde indiqué dans le formulaire.'],
      ['Contrôler la location et le foyer', 'Le niveau de loyer et les engagements conditionnent le scénario. Renseignez les amortissements déjà déduits et ceux des autres logements concernés du foyer pour éviter de réutiliser un plafond consommé.'],
      ['Lire la déduction et l’effet fiscal', 'La dotation théorique peut être limitée par le prorata, la base restante et le plafond disponible. Une déduction du revenu ne se confond pas avec une réduction d’impôt du même montant.'],
    ],
    examples: [{ title: 'Une année entière dans le neuf intermédiaire', context: 'Prix de 250 000 €, conditions confirmées, aucun amortissement antérieur ou concurrent ; année complète suivant l’acquisition.', rows: [['Base retenue : 250 000 × 80 %', '200 000 €'], ['Dotation théorique : 200 000 × 3,5 %', '7 000 €'], ['Si le plafond restant du foyer est de 5 000 €', 'Déduction limitée à 5 000 €']], conclusion: 'Les 5 000 € sont une déduction, pas un remboursement d’impôt. L’effet fiscal dépend ensuite des loyers, charges, intérêts et revenus du foyer.' }],
    faq: [
      ['La confirmation remplace-t-elle les justificatifs ?', 'Non. Elle indique que vous avez vérifié les conditions. Le simulateur ne contrôle pas l’acte, le bail, les ressources du locataire ou les caractéristiques techniques du logement.'],
      ['Puis-je saisir des travaux pour un logement neuf ?', 'Dans le parcours neuf de cet outil, les travaux séparés doivent rester à zéro. Le parcours ancien a ses propres champs et critères.'],
      ['Le simulateur liquide-t-il les reports et la revente ?', 'Il présente le calcul annuel dans son périmètre. Il ne reconstitue pas tous les reports antérieurs et ne calcule pas ici la cession du logement.'],
    ],
    sources: [['https://www.service-public.gouv.fr/particuliers/vosdroits/F39735', 'Service Public — conditions et calcul de Relance logement']],
    related: [['/revenus-fonciers', 'Détailler les revenus et charges fonciers'], ['/investissement-locatif', 'Comparer les flux du projet locatif']],
  },
  '/assurance-vie': {
    title: 'Choisir entre rachat, transmission et projection',
    intro: 'Un retrait du vivant du souscripteur et un capital versé au décès ne suivent pas le même calcul. Les onglets correspondent à ces usages ; le décompte de l’assureur fournit les données fiscales utiles.',
    steps: [
      ['Pour un rachat', 'Renseignez la valeur du contrat, les primes et la somme retirée. Reprenez la part de produits et les régimes avant/après 2017 du décompte, ainsi que l’abattement annuel déjà utilisé et le solde social si vous les connaissez.'],
      ['Pour une transmission', 'Ventilez les capitaux et primes relevant des régimes proposés. Les montants et abattements déjà utilisés chez d’autres assureurs doivent être pris en compte ; ajoutez chaque bénéficiaire avec sa situation.'],
      ['Pour une projection', 'Le rendement et les versements futurs sont des hypothèses de capitalisation. Comparez plusieurs scénarios et gardez à l’esprit que la valeur future ne constitue pas une promesse contractuelle.'],
    ],
    examples: [{ title: 'Isoler l’impôt sur les produits d’un rachat', context: 'Contrat de huit ans ou plus ; 10 000 € de produits intégralement éligibles au taux de 7,5 %, personne seule et abattement annuel intact.', rows: [['Produits du rachat', '10 000 €'], ['Abattement disponible', '− 4 600 €'], ['Base pour l’IR', '5 400 €'], ['IR à 7,5 %', '405 €']], conclusion: 'L’exemple porte sur l’IR des produits, pas sur la totalité du retrait. Les prélèvements sociaux et les autres régimes de produits se calculent séparément.' }],
    faq: [
      ['Tout le montant retiré est-il un gain imposable ?', 'Non. Un rachat comprend du capital et une fraction de produits. Le décompte de l’assureur permet de reprendre cette fraction et sa ventilation fiscale.'],
      ['Pourquoi indiquer les autres contrats ?', 'Certaines règles et certains abattements s’apprécient au-delà du seul contrat simulé. Ignorer les montants déjà utilisés peut sous-estimer l’impôt.'],
      ['Comment éviter de compter deux fois les prélèvements sociaux ?', 'Renseignez le solde restant indiqué par l’assureur lorsqu’il est disponible. Le formulaire distingue ce solde d’une estimation appliquée à tous les produits du rachat.'],
      ['Les anciens contrats sont-ils tous couverts ?', 'Non. Le module précise les dates et régimes couverts. Les exonérations historiques, clauses démembrées et situations particulières nécessitent un examen adapté.'],
    ],
    sources: [[impots + 'lassurance-vie-et-le-pea-0', 'DGFiP — fiscalité de l’assurance-vie'], ['https://www.impots.gouv.fr/je-suis-beneficiaire-dune-assurance-vie', 'DGFiP — bénéficiaire d’une assurance-vie']],
    related: [['/succession', 'Articuler assurance-vie et succession']],
  },
  '/holding': {
    title: 'Suivre les fonds entre SCI, holding et associé',
    intro: 'Le montage comporte plusieurs niveaux de résultat et d’imposition. Une remontée de fonds à la holding n’est pas encore un revenu personnel disponible.',
    steps: [
      ['Décrire le groupe', 'Renseignez l’activité immobilière, les charges, les financements et les participations. Le scénario holding suppose des sociétés à l’IS et les conditions du régime retenu doivent être confirmées.'],
      ['Suivre les distributions', 'Les fonds passent de la filiale à la holding, puis éventuellement à la personne. Distinguez dividendes, charges de holding et remboursement des financements.'],
      ['Comparer un périmètre identique', 'L’outil permet d’examiner les flux proposés ; les frais d’entrée et la fiscalité de sortie ne sont pas projetés par ce modèle holding. Ne les assimilez pas à des coûts nuls.'],
    ],
    examples: [{ title: 'Une remontée de dividendes à la holding', context: '10 000 € de dividendes éligibles au régime mère-fille ordinaire, quote-part de 5 %, avant autres frais ou déficits.', rows: [['Dividendes reçus', '10 000 €'], ['Quote-part imposable : 10 000 × 5 %', '500 €']], conclusion: 'Les 500 € sont une base d’IS, pas l’impôt lui-même. Une distribution à l’associé personne physique représente une autre étape.' }],
    faq: [
      ['La holding supprime-t-elle l’impôt ?', 'Non. Le régime choisi peut modifier le moment et la base d’imposition. Les coûts du groupe, les conditions d’éligibilité et les distributions personnelles doivent être intégrés à la comparaison.'],
      ['Puis-je assimiler 10 000 € en holding à 10 000 € personnels ?', 'Non. Il faut examiner l’origine des fonds et les modalités de leur sortie. La trésorerie d’une société appartient à cette société.'],
      ['Le régime mère-fille est-il l’intégration fiscale ?', 'Non. Ce sont des dispositifs distincts. Le calculateur n’active pas automatiquement une intégration fiscale du groupe.'],
    ],
    sources: [['https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006162530', 'CGI — article 216 et versions applicables'], ['https://entreprendre.service-public.gouv.fr/vosdroits/F23575', 'Service Public — impôt sur les sociétés']],
    related: [['/sci', 'Examiner la SCI seule'], ['/statut-juridique', 'Comparer les hypothèses de rémunération']],
  },
  '/statut-juridique': {
    title: 'Lire une comparaison financière de statuts',
    intro: 'Le revenu net est un critère de comparaison parmi d’autres. Vérifiez d’abord que votre activité et votre situation correspondent aux hypothèses sociales et fiscales affichées.',
    steps: [
      ['Définir une même enveloppe', 'Le bénéfice avant rémunération et les frais doivent être cohérents entre scénarios. Un salaire net souhaité n’est pas directement comparable à un budget total employeur.'],
      ['Vérifier les hypothèses', 'Le comparateur utilise une activité libérale non réglementée et un foyer prédéfini. Une profession réglementée, notamment une activité notariale, demande un calcul social adapté. Vérifiez aussi capital, compte courant et conditions du taux réduit d’IS.'],
      ['Comparer plusieurs critères', 'Distinguez revenu personnel et bénéfice conservé en société. La protection sociale, les associés, les responsabilités, les coûts de structure et les modalités de transmission ne se résument pas au classement financier.'],
    ],
    examples: [{ title: 'Construire une comparaison à budget identique', context: 'Exemple de préparation des données, avant cotisations et impôts.', rows: [['Recettes annuelles', '80 000 €'], ['Dépenses professionnelles hors rémunération', '− 20 000 €'], ['Enveloppe à comparer entre scénarios', '60 000 €']], conclusion: 'Comparez la même enveloppe dans chaque régime. Le net final dépend des choix de rémunération, distribution et des hypothèses sociales ; il ne se déduit pas d’un taux unique.' }],
    faq: [
      ['Le premier du classement est-il le meilleur statut pour moi ?', 'Il donne le meilleur résultat selon le critère financier calculé et les données saisies. Il ne tranche pas les aspects juridiques, sociaux ou organisationnels de votre projet.'],
      ['Le comparateur convient-il à toutes les professions ?', 'Non. Les professions réglementées et leurs caisses particulières sortent des hypothèses sociales ordinaires retenues. Ne transposez pas ce résultat à un office notarial sans adaptation.'],
      ['Pourquoi les dividendes ne sont-ils pas toujours taxés pareil ?', 'Le régime du dirigeant et certains seuils liés au capital, primes et compte courant interviennent. Le formulaire demande les données du dirigeant simulé, pas un montant arbitrairement réparti entre associés.'],
      ['Les notes du graphique sont-elles un classement officiel ?', 'Non. Ce sont des appréciations éditoriales. Le tableau des montants et les hypothèses permettent de comprendre le calcul financier ; les autres critères doivent être examinés séparément.'],
    ],
    sources: [['https://mon-entreprise.urssaf.fr/simulateurs/comparaison-régimes-sociaux', 'Urssaf — comparaison des régimes sociaux']],
    related: [['/holding', 'Comprendre les flux d’une holding']],
  },
  '/investissement-locatif': {
    title: 'Lire la rentabilité et les avantages fiscaux séparément',
    intro: 'Un investissement combine prix, frais, loyers, charges, financement et fiscalité. Le dispositif sélectionné doit correspondre à la date et aux caractéristiques réelles de l’opération.',
    steps: [
      ['Préparer le coût et les recettes', 'Intégrez les frais d’acquisition, travaux, charges et vacance dans des périodes cohérentes. Le loyer affiché avant charges ne constitue pas votre revenu disponible.'],
      ['Sélectionner un dispositif applicable', 'La présence d’un dispositif dans le comparateur ne signifie pas qu’une nouvelle acquisition y est éligible. Vérifiez les dates d’ouverture et de fermeture, la zone, le logement et les engagements de location.'],
      ['Examiner l’effort de trésorerie', 'Comparez l’avantage fiscal avec les échéances et les dépenses. Une projection de revenus et de prix est un scénario ; les conséquences de la vente doivent aussi être examinées.'],
    ],
    examples: [{ title: 'Reconstituer les flux avant impôt', context: 'Exemple économique annuel, sans dispositif fiscal, vacance déjà déduite des loyers encaissés.', rows: [['Loyers encaissés', '12 000 €'], ['Charges payées', '− 3 000 €'], ['Échéances du prêt, assurance comprise', '− 10 000 €'], ['Effort de trésorerie avant impôt', '− 1 000 €']], conclusion: 'Cette différence n’est pas la base fiscale : l’échéance inclut du capital non déductible. Ajoutez ensuite l’impôt ou l’avantage fiscal effectivement utilisable.' }],
    faq: [
      ['Un dispositif affiché accepte-t-il encore de nouveaux projets ?', 'Pas nécessairement. Certains scénarios servent à étudier un investissement antérieur. La date de réalisation et les engagements doivent correspondre au régime sélectionné.'],
      ['Une réduction d’impôt garantit-elle la rentabilité ?', 'Non. Elle ne protège pas contre la vacance, les travaux, une baisse du prix ou le coût du financement. Comparez aussi les flux économiques avant avantage fiscal.'],
      ['Le plafond national de loyer suffit-il ?', 'Il faut aussi vérifier les paramètres locaux, la surface retenue et les conditions du dispositif. Le loyer simulé n’est pas une validation du bail.'],
    ],
    sources: [['https://www.economie.gouv.fr/particuliers/gerer-mon-argent/beneficier-daides-et-de-reductions-dimpots/investissement-locatif-quelles-sont-vos-reductions-dimpot', 'Ministère de l’Économie — dispositifs locatifs']],
    related: [['/relance-logement', 'Étudier Relance logement'], ['/strategie-immobiliere', 'Comparer détention et revente']],
  },
  '/ifi': {
    title: 'Préparer le patrimoine net taxable à l’IFI',
    intro: 'La valeur totale de vos biens n’est pas toujours l’assiette taxable. Renseignez les actifs et dettes au bon périmètre avant d’interpréter le barème, la décote et le plafonnement.',
    steps: [
      ['Évaluer au 1er janvier', 'Recensez les biens et droits immobiliers du foyer, y compris les participations concernées. Les abattements et exonérations supposent une qualification ; une estimation commerciale ne suffit pas à les justifier.'],
      ['Qualifier les dettes', 'Reprenez les dettes admissibles et leur montant pertinent. Les prêts in fine, dettes familiales et acquisitions démembrées demandent une attention particulière.'],
      ['Lire les corrections au barème', 'Le seuil d’assujettissement et le début du barème sont différents. Les données de revenus et impôts utilisées pour le plafonnement doivent correspondre à la période demandée.'],
    ],
    examples: [{ title: 'Un patrimoine net taxable de 1 350 000 €', context: 'Assiette déjà déterminée, avant réductions et plafonnement.', rows: [['Barème : tranche de 800 000 à 1 300 000 €', '2 500 €'], ['Barème : tranche de 1 300 000 à 1 350 000 €', '350 €'], ['Décote', '− 625 €'], ['IFI après décote', '2 225 €']], conclusion: 'L’exemple suppose que biens, dettes et abattements ont été correctement qualifiés. Les corrections supplémentaires dépendent du dossier.' }],
    faq: [
      ['Pourquoi le calcul commence-t-il à 800 000 € ?', 'Le seuil d’assujettissement est de 1,3 million d’euros de patrimoine net taxable, mais le barème commence à 800 000 €. Ces deux montants ont des fonctions différentes.'],
      ['Puis-je déduire tous mes emprunts ?', 'Non. Les dettes doivent répondre aux conditions de déductibilité. Ne saisissez pas un total de crédits personnels sans vérifier leur lien avec les actifs taxables.'],
      ['Le démembrement réduit-il automatiquement mon IFI ?', 'Non. Les règles d’attribution dépendent notamment de l’origine des droits. Le barème fiscal de nue-propriété ne doit pas être appliqué indistinctement à la base IFI.'],
    ],
    sources: [[impots + 'calcul-de-lifi', 'DGFiP — calcul de l’IFI']],
    related: [['/donation', 'Examiner une transmission'], ['/sci', 'Comprendre la détention en SCI']],
  },
  '/donation': {
    title: 'Calculer les droits du bon couple donateur–bénéficiaire',
    intro: 'Les droits dépendent de ce qui est transmis, de la personne qui donne, de celle qui reçoit et de leur historique. Le module fiscal doit être articulé avec les frais de l’acte.',
    steps: [
      ['Identifier les personnes et les biens', 'Préparez une ventilation par donateur et bénéficiaire. Pour des contributions inégales des parents, ne divisez pas automatiquement le total par deux.'],
      ['Renseigner le droit transmis', 'Pleine propriété et nue-propriété ne représentent pas la même valeur fiscale. Vérifiez la valeur du bien, l’âge pertinent et la nature de l’usufruit dans le périmètre proposé.'],
      ['Reprendre les donations antérieures', 'Le rappel fiscal peut consommer une partie de l’abattement et des premières tranches. Une exonération particulière doit être justifiée avant activation.'],
    ],
    examples: [{ title: 'Donation de nue-propriété à un enfant', context: 'Bien de 300 000 €, usufruitier de 65 ans, nue-propriété entière donnée ; abattement parent-enfant intact.', rows: [['Nue-propriété fiscale : 60 % de 300 000 €', '180 000 €'], ['Abattement disponible', '− 100 000 €'], ['Base taxable', '80 000 €'], ['Droits avant arrondi fiscal', '14 194,35 €']], conclusion: 'Les frais de l’acte s’ajoutent. Le barème fiscal du démembrement ne détermine pas à lui seul les clauses de gestion ou de vente future.' }],
    faq: [
      ['Les deux parents partagent-ils un seul abattement ?', 'L’historique s’examine pour chaque relation entre donateur et bénéficiaire. Préparez les montants de chaque parent et les donations antérieures correspondantes.'],
      ['Une donation sans droits est-elle sans frais ?', 'Non. Un abattement peut annuler les droits fiscaux tout en laissant des frais d’acte, de formalités ou de publicité à payer. Utilisez aussi la prétaxe.'],
      ['Le rappel fiscal et le rapport civil sont-ils identiques ?', 'Non. Le module traite les données fiscales renseignées. L’équilibre civil entre héritiers et les conséquences successorales de la donation demandent un examen distinct.'],
      ['Puis-je appliquer automatiquement une exonération temporaire ?', 'Non. Vérifiez les dates, personnes, nature du don et conditions d’emploi ou de conservation prévues par le dispositif. La simulation suppose ces conditions satisfaites.'],
    ],
    sources: [[impots + 'calcul-et-paiement-des-droits', 'DGFiP — droits de donation'], ['https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006310173', 'CGI 669 — valeur fiscale de l’usufruit et de la nue-propriété']],
    related: [['/pretaxe', 'Ajouter les frais de l’acte'], ['/succession', 'Examiner les droits de succession']],
  },
  '/plusvalue': {
    title: 'Passer du prix de vente à la plus-value imposable',
    intro: 'La différence entre deux prix n’est qu’un point de départ. Les frais admis, travaux, dates, quotes-parts et exonérations déterminent la base du calcul.',
    steps: [
      ['Reprendre les actes', 'Utilisez les dates et valeurs d’acquisition et de cession. Les frais doivent suivre la même quote-part que le bien ou le droit vendu. Pour une acquisition gratuite, reprenez la valeur pertinente de la donation ou succession.'],
      ['Justifier les majorations et exonérations', 'Vérifiez les frais réels ou forfaits proposés, les travaux admissibles et leur traitement fiscal antérieur. Une dépense déjà déduite ne doit pas être reprise sans examiner les règles applicables.'],
      ['Séparer impôt et fonds disponibles', 'L’impôt sur le revenu, les prélèvements sociaux et une éventuelle surtaxe sont présentés séparément. Le capital du prêt encore dû réduit les fonds reçus, pas automatiquement la plus-value.'],
    ],
    examples: [{ title: 'Plus-value brute de 100 000 € après 22 ans', context: '22 années entièrement révolues, résident dans le cas ordinaire, sans autre exonération.', rows: [['Abattement IR', '100 %'], ['IR sur la plus-value', '0 €'], ['Abattement social', '28 %'], ['Base sociale restante', '72 000 €'], ['Prélèvements sociaux à 17,2 %', '12 384 €']], conclusion: 'L’exonération d’IR n’annule pas les prélèvements sociaux dans cet exemple. Les dates exactes sont déterminantes.' }],
    faq: [
      ['Puis-je déduire le prêt restant de la plus-value ?', 'Le remboursement du capital concerne le financement et les fonds disponibles après vente. Il ne constitue pas une majoration automatique du prix d’acquisition fiscal.'],
      ['Un bien détenu depuis 22 ans est-il totalement exonéré ?', 'Dans le cas ordinaire, le calendrier de l’IR et celui des prélèvements sociaux diffèrent. L’exonération totale liée à la durée pour ces derniers intervient après 30 ans.'],
      ['Toutes mes factures de travaux sont-elles admissibles ?', 'Non. La nature des travaux, les justificatifs et les déductions antérieures comptent. Vérifiez les conditions du mode réel ou du forfait sélectionné.'],
    ],
    sources: [[pv, 'DGFiP — prix, frais et abattements de plus-value']],
    related: [['/strategie-immobiliere', 'Calculer les flux jusqu’à la sortie'], ['/lmnp', 'Examiner la revente d’une location meublée']],
  },
  '/revenus-fonciers': {
    title: 'Classer les dépenses avant de comparer micro et réel',
    intro: 'Les loyers encaissés, le revenu imposable et la trésorerie nette ne sont pas identiques. Le bon classement des intérêts, charges, travaux et reports permet une comparaison utile.',
    steps: [
      ['Préparer les recettes et charges', 'Reprenez les loyers et dépenses de l’année. Séparez intérêts et assurance admissibles du capital remboursé ; qualifiez les travaux avant de les inclure.'],
      ['Reconstituer les reports', 'Renseignez les déficits selon leur année d’origine. Le déficit lié aux intérêts et celui issu des autres charges ne s’imputent pas nécessairement sur les mêmes revenus.'],
      ['Interpréter la comparaison', 'Conservez les mêmes dépenses économiques au micro et au réel. Une économie d’impôt sur le revenu global suppose un revenu permettant de l’absorber ; le mode foyer peut affiner cet effet dans son périmètre.'],
    ],
    examples: [{ title: 'Un déficit avec intérêts supérieurs aux loyers', context: 'Loyers 15 000 €, intérêts 18 000 €, autres charges admises 20 000 € forfait de 20 € compris. Pour un local, saisir 19 980 € de charges décaissées. Plafond ordinaire, revenu global suffisant.', rows: [['Déficit total', '23 000 €'], ['Part provenant des intérêts', '3 000 €'], ['Imputation sur le revenu global', '10 700 €'], ['Report sur revenus fonciers', '12 300 €']], conclusion: 'Les reports doivent être suivis par année et les conditions de maintien de la location respectées. Un déficit fiscal ne rembourse pas les dépenses payées.' }],
    faq: [
      ['Pourquoi le capital du prêt n’est-il pas une charge ?', 'Il rembourse une dette. Les intérêts et certains frais de financement ont un traitement fiscal distinct ; l’échéancier permet de les isoler.'],
      ['Puis-je regrouper tous les reports sans date ?', 'Évitez-le. Leur année d’origine permet de suivre leur durée d’utilisation et leur consommation. Reprenez les déclarations antérieures.'],
      ['Le réel est-il toujours préférable avec des travaux ?', 'La nature déductible des travaux, l’éligibilité au micro, les autres revenus et la durée de l’option doivent être examinées. Le montant des factures ne suffit pas.'],
    ],
    sources: [['https://bofip.impots.gouv.fr/bofip/4142-PGP.html/identifiant=BOI-RFPI-BASE-30-20-20250916', 'BOFiP — imputation des déficits fonciers']],
    related: [['/relance-logement', 'Examiner l’amortissement locatif'], ['/sci', 'Détailler un scénario de SCI']],
  },
  '/pret': {
    title: 'Lire une échéance et le coût total du crédit',
    intro: 'Chaque mensualité rembourse du capital et paie des intérêts. L’assurance et les frais complètent le coût ; ils doivent être renseignés pour comparer deux offres sur la même base.',
    steps: [
      ['Reprendre l’offre', 'Utilisez le capital, le taux nominal annuel et la durée. Le modèle porte sur un prêt fixe à déblocage unique ; un différé ou plusieurs déblocages exigent un échéancier adapté.'],
      ['Préciser assurance et frais', 'Vérifiez si l’assurance porte sur le capital initial ou restant dû. Renseignez les frais pris en compte sans ajouter deux fois une même dépense.'],
      ['Lire l’échéancier', 'Le capital restant dû diminue au fil des remboursements. Le taux effectif estimé dépend des coûts et de leur calendrier : il ne s’obtient pas en additionnant taux du prêt et taux d’assurance.'],
    ],
    examples: [{ title: 'Première échéance d’un prêt de 200 000 €', context: '240 mois à 3,5 %, sans assurance ni frais.', rows: [['Mensualité hors assurance', '1 159,92 €'], ['Intérêts du premier mois', '583,33 €'], ['Capital remboursé au premier mois', '576,59 €'], ['Capital restant après cette échéance', '199 423,41 €']], conclusion: 'La part d’intérêts diminue ensuite. La dernière échéance peut être ajustée pour solder les centimes restants.' }],
    faq: [
      ['Une durée plus longue réduit-elle toujours le coût ?', 'Elle peut réduire la mensualité tout en augmentant les intérêts et l’assurance cumulés. Comparez simultanément l’échéance et le coût total.'],
      ['Le taux effectif affiché vaut-il celui du contrat ?', 'Il s’agit d’une estimation fondée sur les frais et le calendrier saisis. L’offre contractuelle peut intégrer d’autres coûts obligatoires ou modalités de paiement.'],
      ['Où voir combien je peux emprunter ?', 'Utilisez le calculateur de capacité d’emprunt avec vos revenus, crédits et apport, puis revenez ici pour détailler l’échéancier du financement envisagé.'],
    ],
    sources: [[credit, 'HCSF — financement immobilier']],
    related: [['/capacite-emprunt', 'Estimer mon budget d’achat'], ['/pretaxe', 'Préparer les frais des actes de financement']],
  },
  '/viager': {
    title: 'Relier valeur du bien, occupation, bouquet et rente',
    intro: 'Le prix d’un viager dépend des droits réservés et des clauses. Le simulateur propose un scénario financier ou utilise un coefficient actuariel que vous fournissez ; il ne prédit pas une durée de vie.',
    steps: [
      ['Décrire les droits', 'Précisez valeur du bien, occupation et bouquet. La valeur économique d’un droit d’usage ne se déduit pas automatiquement du barème fiscal de l’usufruit.'],
      ['Choisir une méthode de conversion', 'Un horizon financier permet une comparaison arithmétique. Pour une tarification actuarielle, le coefficient doit correspondre au dossier, à la table, au taux, à la périodicité et aux clauses de réversion.'],
      ['Distinguer prix et fiscalité', 'L’âge pertinent au premier versement intervient dans la fraction imposable de la rente. Il ne détermine pas à lui seul le prix. Vérifiez séparément occupation, taxe foncière et clauses de charges.'],
    ],
    examples: [{ title: 'Du capital à une rente financière', context: 'Valeur libre 250 000 €, valeur d’occupation négociée 80 000 €, bouquet 50 000 €. Scénario linéaire à taux nul sur dix ans.', rows: [['Capital à convertir : 250 000 − 80 000 − 50 000', '120 000 €'], ['Horizon de comparaison', '120 mois'], ['Rente mensuelle du scénario', '1 000 €']], conclusion: 'Les dix ans ne sont ni une espérance de vie ni une date de fin du contrat. Une rente viagère reste due selon les clauses de l’acte.' }],
    faq: [
      ['Le paiement s’arrête-t-il à la fin de l’horizon choisi ?', 'Non. L’horizon sert au scénario financier. La durée réelle de paiement dépend du caractère viager de la rente et des clauses du contrat.'],
      ['Un barème actuariel est-il intégré ?', 'Aucune table de mortalité n’est intégrée. Le mode actuariel utilise un coefficient établi pour le dossier et renseigné par vous.'],
      ['L’âge fiscal détermine-t-il le montant de la rente ?', 'Non. La fraction imposable et la valorisation économique répondent à des questions différentes. Les rentes réversibles ou sur plusieurs têtes demandent une vérification spécifique.'],
    ],
    sources: [['https://www.service-public.gouv.fr/particuliers/vosdroits/F2762', 'Service Public — vente en viager'], ['https://www.service-public.gouv.fr/particuliers/vosdroits/F3173', 'Service Public — imposition des rentes']],
    related: [['/plusvalue', 'Examiner la plus-value de cession']],
  },
};
