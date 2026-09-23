'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { elegirFraseSinRepetir } from '@/lib/frases';
import SeniorRexReaction from '@/components/SeniorRexReaction';

type ProductoHistorial = {
  productId: string;
  nombre: string;
  emoji: string;
  veces: number;
  ultimaVez: string;
};

const FAMILY_ID = 'a3e746d1-2cac-4f07-a988-de3678c1fe00';

export default function HistorialPage() {
  const [productos, setProductos] = useState<ProductoHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [rexTrigger, setRexTrigger] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function loadHistorial() {
      const { data } = await supabase
        .from('historial_compras')
        .select('product_id, fecha, products(nombre, emoji)')
        .order('fecha', { ascending: false });

      if (data) {
        const filas = data as unknown as {
          product_id: string;
          fecha: string;
          products: { nombre: string; emoji: string } | null;
        }[];

        const conteo: Record<string, ProductoHistorial> = {};
        filas.forEach((row) => {
          const id = row.product_id;
          if (!conteo[id]) {
            conteo[id] = {
              productId: id,
              nombre: row.products?.nombre ?? 'Producto',
              emoji: row.products?.emoji ?? '🛒',
              veces: 0,
              ultimaVez: row.fecha,
            };
          }
          conteo[id].veces += 1;
        });

        const ordenado = Object.values(conteo).sort((a, b) => b.veces - a.veces);
        setProductos(ordenado);
      }
      setLoading(false);
    }

    loadHistorial();
  }, []);

  async function handleAdd(item: ProductoHistorial) {
    setAddingId(item.productId);
    const supabase = createClient();
    const frase = await elegirFraseSinRepetir(item.productId);
    const { data: userData } = await supabase.auth.getUser();

    await supabase.from('cesta').insert({
      product_id: item.productId,
      comentario_ia: frase,
      anadido_por: userData.user?.id ?? null,
    });

    await supabase.from('historial_compras').insert({
      product_id: item.productId,
      family_id: FAMILY_ID,
    });

    fetch('/api/notificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto: item.nombre,
        familia_id: FAMILY_ID,
      }),
    }).catch(() => {});

    setAddingId(null);
    setRexTrigger((prev) => prev + 1);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <SeniorRexReaction trigger={rexTrigger} type="yes" />

      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 p-4">
        <h1 className="text-xl font-semibold">Ranking de productos</h1>
        <p className="text-xs text-zinc-500 mt-1">Los más comprados de siempre — añade directamente a la cesta</p>
      </div>

      <div className="p-4">
        {loading ? (
          <p className="text-zinc-500">Cargando historial...</p>
        ) : productos.length === 0 ? (
          <p className="text-zinc-500 text-sm">Todavía no hay historial de compras.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {productos.map((p, i) => (
              <div
                key={p.productId}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              >
                <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-zinc-200">{p.nombre}</p>
                  <p className="text-xs text-zinc-500">
                    {p.veces}× · última vez {new Date(p.ultimaVez).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(p)}
                  disabled={addingId === p.productId}
                  className="text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {addingId === p.productId ? '...' : '+ Añadir'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
