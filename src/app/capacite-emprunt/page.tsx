import {CalculatorJsonLd} from '@/components/JsonLd';
import MainLayout from '@/components/MainLayout';
import ProjectCalculators from '@/components/ProjectCalculators';
import {buildMetadata} from '@/lib/seo';
export const metadata=buildMetadata('/capacite-emprunt');
export default function Page(){return <MainLayout><CalculatorJsonLd path="/capacite-emprunt" name="" description=""/><div className="mx-auto max-w-6xl px-5 py-10 text-slate-800"><h1 className="text-3xl font-bold">Capacité d’emprunt et budget immobilier</h1><p className="mt-4 max-w-4xl leading-relaxed">Estimez le prix d’achat accessible avec vos revenus, vos crédits existants, votre apport et une provision de frais. Le cadre HCSF prévoit en principe 35 % de taux d’effort assurance comprise et 25 ans, avec des exceptions encadrées. Un calcul favorable ne vaut pas accord bancaire.</p><ProjectCalculators mode="capacite"/></div></MainLayout>}
