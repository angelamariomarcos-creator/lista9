export default function ProductosMasCompradosCard() {
  return (
    <a
      href="/historial"
      className="block bg-white rounded-2xl shadow-sm p-6 transition-shadow hover:shadow-md cursor-pointer"
    >
      <h3 className="text-lg font-semibold mb-1 text-zinc-900">Productos más comprados</h3>
      <p className="text-gray-400 text-sm">Ver el ranking completo y añadir a la cesta →</p>
    </a>
  );
}
