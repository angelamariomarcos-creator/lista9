import SeniorRexBanner from '@/components/SeniorRexBanner';

export const metadata = {
  title: 'Senior Rex Analytics — Lista9',
};

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <SeniorRexBanner />

      <h1 className="text-3xl font-bold mb-2">🦖 Senior Rex Analytics</h1>
      <p className="text-gray-500 mb-8">
        El cuadro de mandos de la Familia García — gasto, ranking y predicciones.
      </p>

      {/* TODO: gráfico gasto mensual por semana (Recharts) */}
      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Gasto semanal</h2>
        <p className="text-gray-400 text-sm">Próximamente — gráfico con Recharts</p>
      </section>

      {/* TODO: mapa de calor productos más comprados */}
      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Productos más comprados</h2>
        <p className="text-gray-400 text-sm">Próximamente — mapa de calor</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TODO: contador en vivo de cesta */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Cesta en vivo</h2>
          <p className="text-gray-400 text-sm">Próximamente — contador realtime</p>
        </section>

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
    </main>
  );
}


