"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const FAMILIA = [
  { id: "670cf46a-e1c5-495c-824d-54e6b3c808b5", nombre: "Mamá", color: "bg-pink-500" },
  { id: "a76c08ae-2702-466b-9abd-5b7c9b7b8e13", nombre: "Papá", color: "bg-blue-500" },
];

export default function RankingFamiliarCard() {
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function cargar() {
      const { data } = await supabase
        .from("cesta")
        .select("anadido_por");

      const counts: Record<string, number> = {};
      (data ?? []).forEach((row) => {
        const uid = row.anadido_por as string | null;
        if (!uid) return;
        counts[uid] = (counts[uid] ?? 0) + 1;
      });

      setConteos(counts);
      setLoading(false);
    }

    cargar();
  }, []);

  const max = Math.max(1, ...FAMILIA.map((f) => conteos[f.id] ?? 0));

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 text-zinc-900">Ranking familiar</h2>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {FAMILIA.map((persona) => {
            const cantidad = conteos[persona.id] ?? 0;
            const porcentaje = Math.round((cantidad / max) * 100);

            return (
              <div key={persona.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-700">{persona.nombre}</span>
                  <span className="text-zinc-400">{cantidad}</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${persona.color} rounded-full transition-all duration-500`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
