"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type DespensaRow = {
  id: string;
  products: {
    nombre: string;
    emoji: string;
    categoria: string;
  } | null;
};

export default function DespensaPage() {
  const [items, setItems] = useState<DespensaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const supabase = createClient();
    const { data } = await supabase
      .from("despensa")
      .select("id, products(nombre, emoji, categoria)")
      .eq("family_id", "a3e746d1-2cac-4f07-a988-de3678c1fe00")
      .order("creado_en", { ascending: false });

    if (data) setItems(data as unknown as DespensaRow[]);
    setLoading(false);
  }

  async function handleQuitar(id: string) {
    const supabase = createClient();
    await supabase.from("despensa").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const agrupados = items.reduce<Record<string, DespensaRow[]>>((acc, item) => {
    const cat = item.products?.categoria ?? "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Cargando despensa...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 p-4">
      <div className="flex items-center gap-2 mb-4">
        <a href="/" className="text-zinc-400 hover:text-white text-xl">←</a>
        <h1 className="text-xl font-semibold">🏠 Mi despensa</h1>
        <span className="text-zinc-500 text-sm">({items.length})</span>
      </div>

      {items.length === 0 && (
        <p className="text-zinc-500 text-sm text-center mt-10">
          Tu despensa está vacía. Marca productos con 🏠 para añadirlos.
        </p>
      )}

      <div className="space-y-4">
        {Object.entries(agrupados).sort((a, b) => a[0].localeCompare(b[0])).map(([cat, catItems]) => (
          <div key={cat}>
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
              {cat} ({catItems.length})
            </h2>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.products?.emoji ?? "🛒"}</span>
                    <span className="text-sm text-white">{item.products?.nombre ?? "Producto"}</span>
                  </div>
                  <button
                    onClick={() => handleQuitar(item.id)}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-2 py-1 rounded-lg transition-colors"
                  >
                    Se acabó
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}