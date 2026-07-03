"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Sugerencia = {
  product_id: string;
  nombre: string;
  emoji: string;
  dias_sin_comprar: number;
};

type ProductoBasico = {
  id: string;
  nombre: string;
  emoji: string;
  categoria: string;
};

type PrediccionRexProps = {
  onAdd: (product: ProductoBasico) => void;
};

export default function PrediccionRex({ onAdd }: PrediccionRexProps) {
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function calcular() {
      const { data: historial } = await supabase
        .from("historial_compras")
        .select("product_id, fecha, products(nombre, emoji)")
        .order("fecha", { ascending: true });

      if (!historial || historial.length === 0) {
        setLoading(false);
        return;
      }

      const porProducto: Record<string, { fechas: number[]; nombre: string; emoji: string }> = {};

      (historial as unknown as { product_id: string; fecha: string; products: { nombre: string; emoji: string } | null }[]).forEach((row) => {
        if (!row.products) return;
        if (!porProducto[row.product_id]) {
          porProducto[row.product_id] = { fechas: [], nombre: row.products.nombre, emoji: row.products.emoji };
        }
        porProducto[row.product_id].fechas.push(new Date(row.fecha).getTime());
      });

      const ahora = Date.now();
      const resultado: Sugerencia[] = [];

      Object.entries(porProducto).forEach(([productId, info]) => {
        if (info.fechas.length < 2) return;

        const diffs: number[] = [];
        for (let i = 1; i < info.fechas.length; i++) {
          diffs.push(info.fechas[i] - info.fechas[i - 1]);
        }
        const mediaMs = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const mediaDias = mediaMs / (1000 * 60 * 60 * 24);

        const ultimaCompra = info.fechas[info.fechas.length - 1];
        const diasSinComprar = (ahora - ultimaCompra) / (1000 * 60 * 60 * 24);

        if (diasSinComprar >= mediaDias && mediaDias >= 1) {
          resultado.push({
            product_id: productId,
            nombre: info.nombre,
            emoji: info.emoji,
            dias_sin_comprar: Math.round(diasSinComprar),
          });
        }
      });

      resultado.sort((a, b) => b.dias_sin_comprar - a.dias_sin_comprar);
      setSugerencias(resultado.slice(0, 5));
      setLoading(false);
    }

    calcular();
  }, []);

  if (loading || sugerencias.length === 0) return null;

  return (
    <div className="p-4 pb-0">
      <div className="bg-zinc-900 border border-emerald-900 rounded-xl p-3">
        <p className="text-sm font-medium text-emerald-400 mb-2">
          🦖 Senior Rex sugiere
        </p>
        <div className="space-y-2">
          {sugerencias.map((s) => (
            <div key={s.product_id} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">
                {s.emoji} {s.nombre}{" "}
                <span className="text-zinc-500 text-xs">
                  (llevas {s.dias_sin_comprar} días sin comprarlo)
                </span>
              </span>
              <button
                onClick={() => onAdd({ id: s.product_id, nombre: s.nombre, emoji: s.emoji, categoria: "" })}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-md transition-colors"
              >
                + Añadir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}