import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
export default function MethodologieFiscale() {
  return <MainLayout><article className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-gray-800">
    <h1 className="text-3xl font-bold">Calculs et références fiscales</h1>
    <p>Revue du 8 septembre 2026 : calculs, assiettes et contenus des simulateurs listés ci-dessous, avec tests de cas chiffrés et contrôles dans le navigateur. Cette revue ne constitue pas une certification juridique ni une couverture de toutes les situations particulières. L’impôt sur le revenu utilise le barème 2026 applicable aux revenus 2025. Les projections supposent ces règles constantes.</p>
    <h2 className="text-xl font-semibold">Sources</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li><a className="underline" href="https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032132058">Code de commerce : tarifs des notaires</a></li>
      <li><a className="underline" href="https://www.impots.gouv.fr/droits-denregistrement">DGFiP : DMTO, tableau au 1er juin 2026</a></li>
      <li><a className="underline" href="https://www.impots.gouv.fr/particulier/calcul-et-paiement-des-droits">DGFiP : donations et barèmes</a></li>
      <li><a className="underline" href="https://www.impots.gouv.fr/particulier/plus-values-imposees">DGFiP : plus-values immobilières</a></li>
      <li><a className="underline" href="https://www.impots.gouv.fr/particulier/calcul-de-lifi">DGFiP : IFI</a></li>
    </ul>
    <h2 className="text-xl font-semibold">Hypothèses à vérifier pour votre simulation</h2>
    <p>Le calcul des droits de succession est désormais distinct et accessible depuis le module donation. Les parts nettes civiles sont renseignées par héritier ; les frais des actes notariaux restent accessibles dans la prétaxe. Donation : un donateur et un bénéficiaire sélectionné à la fois. Les exonérations de dons d’argent supposent leurs plafonds disponibles et les conditions confirmées. La réduction Dutreil de 50 % sur les droits de la fraction éligible en pleine propriété avant 70 ans est comprise si l’âge et les conditions sont renseignés.</p>
    <p>SCI : comparaison annuelle en location nue au réel, pour des associés personnes physiques résidents relevant de la même TMI. Résultat, amortissement, trésorerie et distribution sont distincts. La revente IS utilise la valeur comptable renseignée ; l’impôt d’une distribution ultérieure du produit de vente n’est pas inclus. Transmission et IFI sont traités dans leurs modules propres.</p>
    <p>Prétaxe : les formalités et débours dépendent du dossier. Le neuf utilise une assiette hors TVA immobilière. Les réductions départementales conditionnelles et tarifs locaux nécessitent un contrôle du dossier. Le bail à construction utilise trois assiettes d’émoluments et une assiette CSI distincte. Les actes de sociétés peuvent nécessiter des droits complémentaires selon la nature des apports.</p>
    <p>IFI : plafonnement pour les résidents fiscaux français, avec revenus mondiaux et impôts de l’année précédente. Prêts in fine ou familiaux, exceptions à la limitation des dettes et déduction de l’IFI lui-même ne sont pas automatisés.</p>
    <p>Viager : scénarios financiers à horizon choisi ou coefficient actuariel fourni par votre professionnel, sans table de mortalité intégrée. La fraction imposable de la rente est séparée de sa tarification.</p>
    <p>Holding : SCI et mère IS distinctes, remboursements du capital compris dans la trésorerie, quote-part mère-fille après frais, distributions plafonnées. La comparaison n’inclut pas la fiscalité de revente. Statuts : modèles sociaux Urssaf publiés en juillet 2026, avec les hypothèses de foyer et d’activité précisées dans le module.</p>
    <p>Retraite : relevés de carrière requis, durées tous régimes et durée liquidable distinctes, calendrier de septembre 2026, prélèvements base et complémentaire séparés. Les montants des caisses libérales et complémentaires non Agirc-Arrco sont saisis ; aucune pension forfaitaire n’est reconstruite. Les projections gardent les paramètres monétaires 2026 constants.</p>
    <p>Plus-values immobilières : prix et frais sur une même quote-part ; droits démembrés valorisés d’après les actes, durée de date à date et exonérations sous conditions. Plus-values professionnelles : les branches IR, IS et titres privés sont séparées ; sans cotisations connues sur le court terme, le total reste provisoire. Les moins-values reportables et la compensation de plusieurs actifs ne sont pas automatisées.</p>
    <p>Location meublée : seuils micro 2026, statut LMP distinct des cotisations sociales, amortissements plafonnés et réintégration à la revente selon le CGI 150 VB. Les cotisations requises sont saisies d’après l’Urssaf. Les reports de déficit et amortissements doivent correspondre à la comptabilité réelle.</p>
    <p>Revenus fonciers : intérêts imputés en priorité, plafond énergétique conditionnel, reports par millésime et dépenses identiques entre régimes. Assurance-vie : solde social réel fourni par l’assureur et assiettes successorales renseignées ; les cas historiques particuliers demandent un calcul adapté.</p>
    <p>Prêt : échéancier arrondi au centime, assurance sur capital initial ou restant dû, taux nul et frais. Le taux effectif est une estimation conditionnée à la saisie de tous les frais obligatoires ; le respect du taux d’usure n’est pas validé automatiquement. Investissement locatif : éligibilité, dates, plafonds et impôt disponible doivent être confirmés ; les nouveaux dispositifs non proposés ne sont pas implicitement couverts.</p>
    <Link href="/" className="inline-block underline">Retour aux simulateurs</Link>
  </article></MainLayout>;
}
