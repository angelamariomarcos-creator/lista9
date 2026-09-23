'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type SemanaGasto = { label: string; total: number };

function inicioSemana(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = domingo ... 6 = sábado
  const diff = (day === 0 ? -6 : 1) - day; // lunes como inicio de semana
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function GastoSemanalCard() {
  const [semanas, setSemanas] = useState<SemanaGasto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadGastoSemanal() {
      const hoy = new Date();
      const inicioSemanaActual = inicioSemana(hoy);
      const inicioRango = new Date(inicioSemanaActual);
      inicioRango.setDate(inicioRango.getDate() - 7 * 5); // 6 semanas en total (actual + 5 anteriores)

      const { data } = await supabase
        .from('tickets')
        .select('creado_en, total')
        .gte('creado_en', inicioRango.toISOString());

      const buckets: number[] = [0, 0, 0, 0, 0, 0];
      const labels: string[] = ['', '', '', '', '', ''];

      for (let i = 5; i >= 0; i--) {
        const inicio = new Date(inicioSemanaActual);
        inicio.setDate(inicio.getDate() - 7 * i);
        labels[5 - i] = inicio.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      }

      (data ?? []).forEach((t) => {
        const fecha = new Date(t.creado_en as string);
        const semanasAtras = Math.round(
          (inicioSemanaActual.getTime() - inicioSemana(fecha).getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        const idx = 5 - semanasAtras;
        if (idx >= 0 && idx <= 5) {
          buckets[idx] += Number(t.total || 0);
        }
      });

      setSemanas(buckets.map((total, i) => ({ label: labels[i], total })));
      setLoading(false);
    }

    loadGastoSemanal();
  }, []);

  const maxTotal = Math.max(...semanas.map((s) => s.total), 1);
  const hayDatos = semanas.some((s) => s.total > 0);

  return (
    <a href="/gastos" className="block bg-white rounded-2xl shadow-sm p-6 transition-shadow hover:shadow-md cursor-pointer">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900">Gasto semanal</h3>
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando…</p>
      ) : !hayDatos ? (
        <p className="text-gray-500 text-sm">Todavía no hay tickets registrados.</p>
      ) : (
        <div className="flex items-end gap-3">
          {semanas.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-zinc-700 h-4">
                {s.total > 0 ? `${s.total.toFixed(0)}€` : ''}
              </span>
              <div className="w-full h-28 flex items-end">
                <div
                  className="w-full rounded-t-md bg-emerald-500 transition-all"
                  style={{ height: `${Math.max((s.total / maxTotal) * 100, s.total > 0 ? 6 : 0)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </a>
  );
}
