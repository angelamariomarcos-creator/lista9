"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Ticket = {
  id: string;
  imagen_url: string | null;
  total: number;
  creado_en: string;
};

type ItemConCategoria = {
  categoria: string;
  precio: number;
};

type TicketItemCompleto = {
  nombre_producto: string;
  categoria: string;
  precio: number;
  tickets: { creado_en: string; total: number } | null;
};

export default function GastosPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [porCategoria, setPorCategoria] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function cargar() {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data: ticketsData } = await supabase
        .from("tickets")
        .select("id, imagen_url, total, creado_en")
        .gte("creado_en", inicioMes.toISOString())
        .order("creado_en", { ascending: false });

      if (ticketsData) setTickets(ticketsData);

      const { data: itemsData } = await supabase
        .from("ticket_items")
        .select("categoria, precio, tickets!inner(creado_en)")
        .gte("tickets.creado_en", inicioMes.toISOString());

      if (itemsData) {
        const agrupado: Record<string, number> = {};
        (itemsData as unknown as ItemConCategoria[]).forEach((item) => {
          agrupado[item.categoria] = (agrupado[item.categoria] || 0) + Number(item.precio);
        });
        setPorCategoria(agrupado);
      }

      setLoading(false);
    }

    cargar();
  }, []);

  const totalMes = tickets.reduce((acc, t) => acc + Number(t.total || 0), 0);
  const maxCategoria = Math.max(...Object.values(porCategoria), 1);

  function fraseRex(): string {
    if (totalMes === 0) return "Ni un ticket este mes. ¿Vivís del aire o me estáis ocultando algo? 🦖";
    if (totalMes < 100) return `Solo ${totalMes.toFixed(0)}€ este mes. Ahorradores natos, me tenéis orgulloso.`;
    if (totalMes < 300) return `${totalMes.toFixed(0)}€ gastados. Normalito, ni para presumir ni para preocuparse.`;
    return `${totalMes.toFixed(0)}€ este mes... ¿estáis comprando para un búnker nuclear o qué pasa aquí?`;
  }

  async function handleExportarCSV() {
    const supabase = createClient();
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data: itemsData } = await supabase
      .from("ticket_items")
      .select("nombre_producto, categoria, precio, tickets!inner(creado_en, total)")
      .gte("tickets.creado_en", inicioMes.toISOString())
      .order("tickets.creado_en", { ascending: true });

    if (!itemsData || itemsData.length === 0) {
      alert("No hay datos para exportar este mes.");
      return;
    }

    const filas = (itemsData as unknown as TicketItemCompleto[]).map((item) => {
      const fecha = item.tickets ? new Date(item.tickets.creado_en).toLocaleDateString("es-ES") : "";
      return `"${fecha}","${item.nombre_producto}","${item.categoria}","${Number(item.precio).toFixed(2)}"`;
    });

    const cabecera = '"Fecha","Producto","Categoria","Precio (EUR)"';
    const totalFila = `"","TOTAL","","${totalMes.toFixed(2)}"`;
    const csv = [cabecera, ...filas, totalFila].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const mes = new Date().toLocaleString("es-ES", { month: "long", year: "numeric" });
    link.href = url;
    link.download = `gastos_${mes}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Cargando gastos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <a href="/" className="text-zinc-400 hover:text-white text-xl" aria-label="Volver al inicio">←</a>
          <h1 className="text-xl font-semibold">Gastos del mes</h1>
        </div>
        {tickets.length > 0 && (
          <div className="relative group">
            <button
              onClick={handleExportarCSV}
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Exportar CSV
            </button>
            <div className="absolute bottom-10 right-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              📊 Descarga todos los gastos del mes en formato Excel/CSV con fecha, producto, categoría y precio
            </div>
          </div>
        )}
      </div>

      <div className="relative group mb-6">
        <a href="/tickets" className="block text-center bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium">
          + Añadir ticket
        </a>
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-center">
          🧾 Sube un ticket del supermercado — añade los productos y su precio para llevar el control mensual
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
        <p className="text-sm text-zinc-400 mb-1">Total este mes</p>
        <p className="text-3xl font-bold">{totalMes.toFixed(2)} €</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm italic text-zinc-300">🦖 {fraseRex()}</p>
      </div>

      {Object.keys(porCategoria).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Por categoría</h2>
            <div className="relative group">
              <span className="text-xs text-zinc-600 cursor-help">(?)</span>
              <div className="absolute bottom-6 left-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                📊 Desglose de cuánto has gastado en cada sección del supermercado este mes
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(porCategoria)
              .sort((a, b) => b[1] - a[1])
              .map(([categoria, importe]) => (
                <div key={categoria}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{categoria}</span>
                    <span className="text-zinc-400">{importe.toFixed(2)} €</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(importe / maxCategoria) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">Tickets del mes</h2>
      <div className="space-y-2">
        {tickets.length === 0 && (
          <p className="text-zinc-500 text-sm text-center mt-6">No hay tickets este mes todavía.</p>
        )}
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <span className="text-sm text-zinc-400">{new Date(ticket.creado_en).toLocaleDateString("es-ES")}</span>
            <span className="font-medium">{Number(ticket.total).toFixed(2)} €</span>
          </div>
        ))}
      </div>
    </main>
  );
}