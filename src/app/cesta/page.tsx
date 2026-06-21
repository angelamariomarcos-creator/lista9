"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import CestaItem from "@/components/CestaItem";

type CestaRow = {
  id: string;
  comentario_ia: string | null;
  comprado: boolean;
  products: {
    nombre: string;
    emoji: string;
  } | null;
};

const NUMERO_JAVI = "34669558210";
const NUMERO_VANE = "34626248847";
const URL_CESTA = "https://lista9.vercel.app/cesta";

function generarLinkSimple(destinatario: "javi" | "vane"): string {
  const numero = destinatario === "javi" ? NUMERO_JAVI : NUMERO_VANE;
  const mensaje = `Senior Rex te manda la lista de la compra: ${URL_CESTA}`;
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${mensajeCodificado}`;
}

export default function CestaPage() {
  const [items, setItems] = useState<CestaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadCesta() {
      const { data, error } = await supabase
        .from("cesta")
        .select("id, comentario_ia, comprado, products(nombre, emoji)")
        .order("creado_en", { ascending: false });

      if (!error && data) {
        setItems(data as unknown as CestaRow[]);
      }
      setLoading(false);
    }

    loadCesta();

    const channel = supabase
      .channel("cesta-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cesta" },
        () => {
          loadCesta();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleRemove(id: string) {
    const supabase = createClient();
    await supabase.from("cesta").delete().eq("id", id);
  }

  async function handleToggle(id: string, comprado: boolean) {
    const supabase = createClient();
    await supabase.from("cesta").update({ comprado }).eq("id", id);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Cargando cesta...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 p-4">
        <h1 className="text-xl font-semibold mb-3">
          Tu cesta{" "}
          <span className="text-zinc-500 text-sm font-normal">
            ({items.length})
          </span>
        </h1>
        <div className="flex gap-2">
          
          <a
            href={generarLinkSimple("javi")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg transition-colors"
          >
            Enviar a Javi
          </a>
          
          <a
            href={generarLinkSimple("vane")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg transition-colors"
          >
            Enviar a Vane
          </a>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {items.length === 0 && (
          <p className="text-zinc-500 text-sm text-center mt-10">
            La cesta esta vacia. Senior Rex espera tus productos.
          </p>
        )}

        <AnimatePresence>
          {items.map((item) => (
            <CestaItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onToggle={handleToggle}
            />
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
