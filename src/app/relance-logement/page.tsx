import {CalculatorJsonLd} from '@/components/JsonLd';
import MainLayout from '@/components/MainLayout';
import ProjectCalculators from '@/components/ProjectCalculators';
import {buildMetadata} from '@/lib/seo';
export const metadata=buildMetadata('/relance-logement');
export default function Page(){return <MainLayout><CalculatorJsonLd path="/relance-logement" name="" description=""/><div className="mx-auto max-w-6xl px-5 py-10 text-slate-800"><h1 className="text-3xl font-bold">Relance logement : amortissement et effet fiscal</h1><p className="mt-4 max-w-4xl leading-relaxed">Estimez une année de déduction Jeanbrun pour un logement neuf ou ancien réhabilité. La qualification du bien, du bail et des travaux est à confirmer avant de retenir l’avantage. Les montants du formulaire sont des exemples.</p><ProjectCalculators mode="relance"/></div></MainLayout>}
