"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { elegirFraseSinRepetir } from "@/lib/frases";
import ProductCard from "@/components/ProductCard";
import SeniorRexReaction from "@/components/SeniorRexReaction";
import PrediccionRex from "@/components/PrediccionRex";

type Product = {
  id: string;
  nombre: string;
  categoria: string;
  emoji: string;
  precio: number;
};

const CATEGORIA_ICONOS: Record<string, string> = {
  "Bebidas": "/categorias/bebidas.png",
  "Carnicería": "/categorias/carniceria.png",
  "Congelados": "/categorias/congelados.png",
  "Despensa": "/categorias/despensa.png",
  "Frutería": "/categorias/fruteria.png",
  "Higiene": "/categorias/higiene.png",
  "Lácteos": "/categorias/lacteos.png",
  "Limpieza": "/categorias/limpieza.png",
  "Panadería": "/categorias/panaderia.png",
  "Pescadería": "/categorias/pescaderia.png",
  "Verdura": "/categorias/verdura.png",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [rexTrigger, setRexTrigger] = useState(0);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [totalCesta, setTotalCesta] = useState(0);
  const [despensaIds, setDespensaIds] = useState<Set<string>>(new Set());
  const [despensaRowIds, setDespensaRowIds] = useState<Record<string, string>>({});
  const [despensaEstados, setDespensaEstados] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("categoria")
        .order("nombre");
      if (!error && data) setProducts(data);
      setLoading(false);
    }

    async function loadTotalCesta() {
      const { data } = await supabase
        .from("cesta")
        .select("products(precio)")
        .eq("comprado", false);
      if (data) {
        const total = (data as unknown as { products: { precio: number } | null }[])
          .reduce((acc, row) => acc + (row.products?.precio ?? 0), 0);
        setTotalCesta(total);
      }
    }

    async function loadDespensa() {
      const { data } = await supabase
        .from("despensa")
        .select("id, product_id, estado")
        .eq("family_id", "a3e746d1-2cac-4f07-a988-de3678c1fe00");
      if (data) {
        const ids = new Set(data.map((d) => d.product_id as string));
        const rowIds: Record<string, string> = {};
        const estados: Record<string, string> = {};
        data.forEach((d) => {
          rowIds[d.product_id as string] = d.id as string;
          estados[d.product_id as string] = d.estado as string;
        });
        setDespensaIds(ids);
        setDespensaRowIds(rowIds);
        setDespensaEstados(estados);
      }
    }

    loadProducts();
    loadTotalCesta();
    loadDespensa();

    const channel = supabase
      .channel("cesta-home-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cesta" }, () => {
        loadTotalCesta();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleAdd(product: Product) {
    setAddingId(product.id);
    const supabase = createClient();
    const frase = await elegirFraseSinRepetir(product.id);
    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("cesta").insert({
      product_id: product.id,
      comentario_ia: frase,
      anadido_por: userData.user?.id ?? null,
    });

    await supabase.from("historial_compras").insert({
      product_id: product.id,
      family_id: "a3e746d1-2cac-4f07-a988-de3678c1fe00",
    });

    fetch("/api/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        producto: product.nombre,
        familia_id: "a3e746d1-2cac-4f07-a988-de3678c1fe00",
      }),
    }).catch(() => {});

    setAddingId(null);
    setRexTrigger((prev) => prev + 1);
  }

  async function handleDespensa(product: Product, estado: string) {
    const supabase = createClient();

    if (estado === "quitar") {
      const rowId = despensaRowIds[product.id];
      await supabase.from("despensa").delete().eq("id", rowId);
      setDespensaIds((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
      setDespensaRowIds((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
      setDespensaEstados((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
      return;
    }

    if (despensaIds.has(product.id)) {
      const rowId = despensaRowIds[product.id];
      await supabase.from("despensa").update({ estado }).eq("id", rowId);
      setDespensaEstados((prev) => ({ ...prev, [product.id]: estado }));
    } else {
      const { data } = await supabase.from("despensa").insert({
        product_id: product.id,
        family_id: "a3e746d1-2cac-4f07-a988-de3678c1fe00",
        estado,
      }).select().single();

      if (data) {
        setDespensaIds((prev) => new Set([...prev, product.id]));
        setDespensaRowIds((prev) => ({ ...prev, [product.id]: data.id }));
        setDespensaEstados((prev) => ({ ...prev, [product.id]: estado }));
      }
    }
  }

  const categorias = Array.from(new Set(products.map((p) => p.categoria))).sort();

  const filtered = products.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = categoriaActiva ? p.categoria === categoriaActiva : true;
    return matchSearch && matchCategoria;
  });

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
      <SeniorRexReaction trigger={rexTrigger} type="yes" />

      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Lista de la Compra 9.0</h1>
          <div className="flex items-center gap-2">
            {totalCesta > 0 && (
              <span className="text-sm font-medium text-emerald-400 bg-emerald-950 px-2 py-1 rounded-lg">
                ~{totalCesta.toFixed(2)} €
              </span>
            )}
            <a href="/despensa" className="text-xs text-blue-400 hover:text-blue-300 bg-blue-950 px-2 py-1 rounded-lg transition-colors">
              🏠 {despensaIds.size}
            </a>
          </div>
        </div>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCategoriaActiva(null); }}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
        />
      </div>

      <PrediccionRex onAdd={handleAdd} />

      {!categoriaActiva && !search && (
        <div className="p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Categorías</p>
          <div className="grid grid-cols-3 gap-3">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-emerald-600 hover:bg-zinc-800 transition-colors"
              >
                {CATEGORIA_ICONOS[cat] ? (
                  <img src={CATEGORIA_ICONOS[cat]} alt={cat} className="w-20 h-20 object-contain mb-1" />
                ) : (
                  <span className="text-3xl mb-1">🛒</span>
                )}
                <span className="text-xs text-zinc-300 text-center leading-tight">{cat}</span>
                <span className="text-xs text-zinc-600 mt-0.5">
                  {products.filter((p) => p.categoria === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(categoriaActiva || search) && (
        <div className="p-4 space-y-6">
          {categoriaActiva && (
            <button
              onClick={() => setCategoriaActiva(null)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-2"
            >
              ← {categoriaActiva}
            </button>
          )}
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
                    onDespensa={handleDespensa}
                    isAdding={addingId === product.id}
                    enDespensa={despensaIds.has(product.id)}
                    estadoDespensa={despensaEstados[product.id]}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}