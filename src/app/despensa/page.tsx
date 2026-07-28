"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { elegirFraseSinRepetir } from "@/lib/frases";

type DespensaRow = {
  id: string;
  estado: string;
  products: {
    id: string;
    nombre: string;
    emoji: string;
    categoria: string;
  } | null;
};

const ORDEN_ESTADO = { "casi_sin": 0, "poco": 1, "suficiente": 2 };

function emojiEstado(estado: string) {
  if (estado === "suficiente") return "🟢";
  if (estado === "poco") return "🟡";
  if (estado === "casi_sin") return "🔴";
  return "⚪";
}

function colorBorde(estado: string) {
  if (estado === "suficiente") return "border-green-900";
  if (estado === "poco") return "border-yellow-900";
  if (estado === "casi_sin") return "border-red-900";
  return "border-zinc-800";
}

export default function DespensaPage() {
  const [items, setItems] = useState<DespensaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [aniadiendoId, setAniadiendoId] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const supabase = createClient();
    const { data } = await supabase
      .from("despensa")
      .select("id, estado, products(id, nombre, emoji, categoria)")
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

  async function handleSeAcabo(item: DespensaRow) {
    if (!item.products) return;
    setAniadiendoId(item.id);
    const supabase = createClient();
    const frase = await elegirFraseSinRepetir(item.products.id);

    await supabase.from("cesta").insert({
      product_id: item.products.id,
      comentario_ia: frase,
      anadido_por: null,
    });

    await supabase.from("historial_compras").insert({
      product_id: item.products.id,
      family_id: "a3e746d1-2cac-4f07-a988-de3678c1fe00",
    });

    await supabase.from("despensa").delete().eq("id", item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setAniadiendoId(null);
  }

  const itemsOrdenados = [...items].sort((a, b) => {
    const oa = ORDEN_ESTADO[a.estado as keyof typeof ORDEN_ESTADO] ?? 2;
    const ob = ORDEN_ESTADO[b.estado as keyof typeof ORDEN_ESTADO] ?? 2;
    return oa - ob;
  });

  const agrupados = itemsOrdenados.reduce<Record<string, DespensaRow[]>>((acc, item) => {
    const cat = item.products?.categoria ?? "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const casiSin = items.filter((i) => i.estado === "casi_sin");

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

      {casiSin.length > 0 && (
        <div className="bg-red-950/30 border border-red-900 rounded-xl p-3 mb-4">
          <p className="text-sm font-medium text-red-400 mb-2">🔴 Casi sin stock — añadir a la cesta</p>
          <div className="space-y-2">
            {casiSin.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">
                  {item.products?.emoji} {item.products?.nombre}
                </span>
                <button
                  onClick={() => handleSeAcabo(item)}
                  disabled={aniadiendoId === item.id}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {aniadiendoId === item.id ? "Añadiendo..." : "🛒 Añadir"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-zinc-500 text-sm text-center mt-10">
          Tu despensa está vacía. Marca productos con 🏠 Stock para añadirlos.
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
                <div key={item.id} className={`flex items-center justify-between bg-zinc-900 border ${colorBorde(item.estado)} rounded-xl p-3`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emojiEstado(item.estado)}</span>
                    <span className="text-2xl">{item.products?.emoji ?? "🛒"}</span>
                    <span className="text-sm text-white">{item.products?.nombre ?? "Producto"}</span>
                  </div>
                  <button
                    onClick={() => handleQuitar(item.id)}
                    className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-900 px-2 py-1 rounded-lg transition-colors"
                  >
                    Quitar
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