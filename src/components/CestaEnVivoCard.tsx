'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function CestaEnVivoCard() {
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [numProductos, setNumProductos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadCesta() {
      const { data } = await supabase
        .from('cesta')
        .select('products(precio)')
        .eq('comprado', false);

      if (data) {
        const rows = data as unknown as { products: { precio: number } | null }[];
        const total = rows.reduce((acc, row) => acc + (row.products?.precio ?? 0), 0);
        setTotalPendiente(total);
        setNumProductos(rows.length);
      }
      setLoading(false);
    }

    loadCesta();

    const channel = supabase
      .channel('cesta-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cesta' }, () => {
        loadCesta();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <a
      href="/cesta"
      className="block bg-white rounded-2xl shadow-sm p-6 transition-shadow hover:shadow-md cursor-pointer"
    >
      <h3 className="text-lg font-semibold mb-2 text-zinc-900">Cesta en vivo</h3>
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando…</p>
      ) : numProductos === 0 ? (
        <p className="text-gray-500 text-sm">La cesta está vacía ahora mismo.</p>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-600">
            {totalPendiente.toFixed(2)} €
          </span>
          <span className="text-sm text-gray-400">
            en {numProductos} producto{numProductos !== 1 ? 's' : ''} pendiente{numProductos !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </a>
  );
}



