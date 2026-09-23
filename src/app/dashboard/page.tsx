import SeniorRexBanner from '@/components/SeniorRexBanner';
import GastoSemanalCard from '@/components/GastoSemanalCard';
import CestaEnVivoCard from '@/components/CestaEnVivoCard';
import ProductosMasCompradosCard from '@/components/ProductosMasCompradosCard';

export const metadata = {
  title: 'Senior Rex Analytics — Lista9',
};

export default function DashboardPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside>
        <SeniorRexBanner />
      </aside>

      <div>
        <h1 className="text-3xl font-bold mb-2">🦖 Senior Rex Analytics</h1>
        <p className="text-gray-500 mb-8">
          El cuadro de mandos de la Familia García — gasto, ranking y predicciones.
        </p>

        <GastoSemanalCard />

        <ProductosMasCompradosCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CestaEnVivoCard />

          {/* TODO: ranking familiar */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Ranking familiar</h2>
            <p className="text-gray-400 text-sm">Próximamente — quién añade más a la cesta</p>
          </section>
        </div>

        {/* TODO: predicción gasto próximo mes + comentario de Rex */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">Predicción del próximo mes</h2>
          <p className="text-gray-400 text-sm">Próximamente — predicción + comentario de Senior Rex</p>
        </section>
      </div>
    </main>
  );
}
