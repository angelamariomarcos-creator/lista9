"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { elegirFraseSinRepetir, elegirFraseIronicaHome } from "@/lib/frases";
import ProductCard from "@/components/ProductCard";
import SeniorRexReaction from "@/components/SeniorRexReaction";
import PrediccionRex from "@/components/PrediccionRex";
import SeniorRexBanner from "@/components/SeniorRexBanner";
import CestaEnVivoCard from "@/components/CestaEnVivoCard";
import GastoSemanalCard from "@/components/GastoSemanalCard";
import ProductosMasCompradosCard from "@/components/ProductosMasCompradosCard";

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
  const pathname = usePathname();
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
  const [fraseIronica, setFraseIronica] = useState<string>("");
  const [toastFrase, setToastFrase] = useState<string>("");
  useEffect(() => {
    if (pathname === "/") {
      elegirFraseIronicaHome().then(setFraseIronica);
    }
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    elegirFraseIronicaHome().then(setFraseIronica);

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
    setToastFrase(frase);
    setTimeout(() => setToastFrase(""), 3000);
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

      {toastFrase && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xs text-center rounded-lg border border-emerald-900 bg-emerald-950/90 px-4 py-2 text-sm text-emerald-200 shadow-xl">
          🦖 {toastFrase}
        </div>
      )}

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
          <SeniorRexBanner />

          {fraseIronica && (
            <div className="mt-4 mb-2 flex items-start gap-2 rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
              <span>🦖</span>
              <span>{fraseIronica}</span>
            </div>
          )}

          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3 mt-4">Categorías</p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className="flex-shrink-0 px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-600 hover:bg-zinc-800 transition-colors"
              >
                <span className="font-brand font-semibold text-sm tracking-wide text-zinc-200 whitespace-nowrap">
                  {cat}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="font-brand text-2xl font-bold mb-1 text-white uppercase">La Lista 9.0</h2>
            <p className="text-zinc-500 mb-6 text-sm">La compra semanal más fácil</p>

            <div className="flex flex-col gap-4">
              <CestaEnVivoCard />
              <GastoSemanalCard />
              <ProductosMasCompradosCard />

              <section className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2 text-zinc-900">Ranking familiar</h3>
                <p className="text-gray-400 text-sm">Próximamente — quién añade más a la cesta</p>
              </section>

              <section className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2 text-zinc-900">Predicción del próximo mes</h3>
                <p className="text-gray-400 text-sm">Próximamente — predicción + comentario de Senior Rex</p>
              </section>
            </div>
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









