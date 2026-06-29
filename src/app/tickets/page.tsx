"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type ItemTicket = {
  nombre: string;
  categoria: string;
  precio: string;
};

const CATEGORIAS = [
  "Bebidas",
  "Limpieza",
  "Carne",
  "Pescado",
  "Fruteria",
  "Lacteos",
  "Despensa",
  "Higiene",
  "Otros",
];

export default function TicketsPage() {
  const router = useRouter();
  const [foto, setFoto] = useState<File | null>(null);
  const [items, setItems] = useState<ItemTicket[]>([
    { nombre: "", categoria: "Despensa", precio: "" },
  ]);
  const [guardando, setGuardando] = useState(false);

  function actualizarItem(index: number, campo: keyof ItemTicket, valor: string) {
    const nuevos = [...items];
    nuevos[index][campo] = valor;
    setItems(nuevos);
  }

  function anadirFila() {
    setItems([...items, { nombre: "", categoria: "Despensa", precio: "" }]);
  }

  function quitarFila(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((acc, item) => acc + (parseFloat(item.precio) || 0), 0);

  async function handleGuardar() {
    setGuardando(true);
    const supabase = createClient();

    let imagenUrl: string | null = null;

    if (foto) {
      const nombreArchivo = `${Date.now()}-${foto.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("tickets")
        .upload(nombreArchivo, foto);

      if (uploadError) {
        console.error("Error al subir la foto:", uploadError);
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("tickets")
          .getPublicUrl(uploadData.path);
        imagenUrl = urlData.publicUrl;
      }
    }

    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        family_id: "a3e746d1-2cac-4f07-a988-de3678c1fe00",
        imagen_url: imagenUrl,
        total: total,
      })
      .select()
      .single();

    if (ticketError || !ticketData) {
      console.error("Error al guardar el ticket:", ticketError);
      setGuardando(false);
      return;
    }

    const itemsValidos = items.filter((i) => i.nombre.trim() !== "");

    if (itemsValidos.length > 0) {
      const { error: itemsError } = await supabase.from("ticket_items").insert(
        itemsValidos.map((i) => ({
          ticket_id: ticketData.id,
          nombre_producto: i.nombre,
          categoria: i.categoria,
          precio: parseFloat(i.precio) || 0,
        }))
      );

      if (itemsError) {
        console.error("Error al guardar los productos:", itemsError);
      }
    }

    setGuardando(false);
    router.push("/gastos");
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 p-4">
      <div className="flex items-center gap-2 mb-4">
        <a href="/" className="text-zinc-400 hover:text-white text-xl" aria-label="Volver al inicio">
          ←
        </a>
        <h1 className="text-xl font-semibold">Añadir ticket</h1>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-2">Foto del ticket (opcional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-zinc-400"
        />
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Producto"
              value={item.nombre}
              onChange={(e) => actualizarItem(index, "nombre", e.target.value)}
              className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
            />
            <select
              value={item.categoria}
              onChange={(e) => actualizarItem(index, "categoria", e.target.value)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 text-sm"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="€"
              value={item.precio}
              onChange={(e) => actualizarItem(index, "precio", e.target.value)}
              className="w-20 rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 text-sm"
            />
            <button
              onClick={() => quitarFila(index)}
              className="text-zinc-500 hover:text-red-400 px-2"
              aria-label="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={anadirFila}
        className="text-sm text-emerald-500 hover:text-emerald-400 mb-6"
      >
        + Añadir producto
      </button>

      <div className="text-lg font-semibold mb-4">
        Total: {total.toFixed(2)} €
      </div>

      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar ticket"}
      </button>
    </main>
  );
}