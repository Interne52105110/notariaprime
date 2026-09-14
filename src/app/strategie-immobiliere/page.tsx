import {CalculatorJsonLd} from '@/components/JsonLd';
import MainLayout from '@/components/MainLayout';
import ProjectCalculators from '@/components/ProjectCalculators';
import {buildMetadata} from '@/lib/seo';
export const metadata=buildMetadata('/strategie-immobiliere');
export default function Page(){return <MainLayout><CalculatorJsonLd path="/strategie-immobiliere" name="" description=""/><div className="mx-auto max-w-6xl px-5 py-10 text-slate-800"><h1 className="text-3xl font-bold">Achat, location et revente : comparer tous les flux</h1><p className="mt-4 max-w-4xl leading-relaxed">Location nue en direct ou SCI à l’IS : suivez un même bien, son financement et le retour des fonds à la personne après la vente. Les années sont des périodes complètes de douze mois, avec les règles fiscales 2026 constantes.</p><ProjectCalculators mode="strategie"/></div></MainLayout>}
