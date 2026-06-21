"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { elegirFraseSinRepetir } from "@/lib/frases";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  nombre: string;
  categoria: string;
  emoji: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("categoria")
        .order("nombre");

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  async function handleAdd(product: Product) {
    setAddingId(product.id);
    const supabase = createClient();
    const frase = await elegirFraseSinRepetir(product.id);

    await supabase.from("cesta").insert({
      product_id: product.id,
      comentario_ia: frase,
    });

    setAddingId(null);
  }

  const filtered = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Cargando productos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 p-4">
  <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Lista de la Compra 9.0</h1>
          <a href="/cesta" className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            Ver cesta
          </a>
        </div>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
        />
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(grouped).map(([categoria, items]) => (
          <section key={categoria}>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-2">
              {categoria}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAdd}
                  isAdding={addingId === product.id}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
