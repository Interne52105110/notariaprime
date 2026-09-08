import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
export default function MethodologieFiscale() {
  return <MainLayout><article className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-gray-800">
    <h1 className="text-3xl font-bold">Calculs et références fiscales</h1>
    <p>Revue du 8 septembre 2026 : barèmes de donation, plus-values immobilières, seuil et décote IFI, déficit foncier et principaux frais d’acquisition. L’impôt sur le revenu utilise le barème 2026 applicable aux revenus 2025. Les projections supposent ces règles constantes.</p>
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
    <p>SCI transmission : valeur nette des parts renseignée, un seul parent, répartition égale entre les enfants associés et abattements intacts. Ce modèle ne constitue pas une liquidation successorale complète.</p>
    <p>Prétaxe : les formalités et débours dépendent du dossier. Le neuf utilise une assiette hors TVA immobilière. Les réductions départementales conditionnelles, tarifs locaux et actes composites nécessitent un calcul adapté.</p>
    <p>IFI : plafonnement pour les résidents fiscaux français, avec revenus mondiaux et impôts de l’année précédente. Prêts in fine ou familiaux, exceptions à la limitation des dettes et déduction de l’IFI lui-même ne sont pas automatisés.</p>
    <p>Viager : scénarios financiers à horizon choisi ou coefficient actuariel fourni par votre professionnel, sans table de mortalité intégrée. La fraction imposable de la rente est séparée de sa tarification.</p>
    <p>Holding : SCI et mère IS distinctes, remboursements du capital compris dans la trésorerie, quote-part mère-fille après frais, distributions plafonnées. La comparaison n’inclut pas la fiscalité de revente. Statuts : modèles sociaux Urssaf publiés en juillet 2026, avec les hypothèses de foyer et d’activité précisées dans le module.</p>
    <p>Les exonérations complexes de plus-value, les droits démembrés et les opérations à plusieurs cédants doivent être vérifiés à partir des actes. Les autres simulateurs, les régimes sociaux et les projections de rendement n’ont pas fait l’objet d’une validation juridique exhaustive dans cette revue.</p>
    <Link href="/" className="inline-block underline">Retour aux simulateurs</Link>
  </article></MainLayout>;
}
