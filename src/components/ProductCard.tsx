"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Product = {
  id: string;
  nombre: string;
  categoria: string;
  emoji: string;
  precio: number;
};

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  onDespensa?: (product: Product, estado: string) => void;
  isAdding?: boolean;
  enDespensa?: boolean;
  estadoDespensa?: string;
};

const ESTADOS = [
  { key: "suficiente", emoji: "🟢", label: "Suficiente" },
  { key: "poco", emoji: "🟡", label: "Poco" },
  { key: "casi_sin", emoji: "🔴", label: "Casi sin" },
];

function colorBorde(estado?: string) {
  if (!estado) return "border-zinc-800 hover:border-emerald-600";
  if (estado === "suficiente") return "border-green-600 bg-green-950/20";
  if (estado === "poco") return "border-yellow-600 bg-yellow-950/20";
  if (estado === "casi_sin") return "border-red-600 bg-red-950/20";
  return "border-zinc-800";
}

function colorTexto(estado?: string) {
  if (!estado) return "text-zinc-300";
  if (estado === "suficiente") return "text-green-400";
  if (estado === "poco") return "text-yellow-400";
  if (estado === "casi_sin") return "text-red-400";
  return "text-zinc-300";
}

function emojiEstado(estado?: string) {
  if (estado === "suficiente") return "🟢";
  if (estado === "poco") return "🟡";
  if (estado === "casi_sin") return "🔴";
  return null;
}

export default function ProductCard({ product, onAdd, onDespensa, isAdding, enDespensa, estadoDespensa }: ProductCardProps) {
  const [mostrarSemaforo, setMostrarSemaforo] = useState(false);

  return (
    <div className="flex flex-col gap-1 relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onAdd(product)}
        disabled={isAdding}
        className={`w-full flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-900 border transition-colors p-3 min-h-[80px] text-center disabled:opacity-50 ${colorBorde(enDespensa ? estadoDespensa : undefined)}`}
      >
        <span className="text-3xl">{product.emoji}</span>
        <span className={`text-xs leading-tight ${colorTexto(enDespensa ? estadoDespensa : undefined)}`}>
          {product.nombre}
        </span>
        {enDespensa && estadoDespensa && (
          <span className="text-sm">{emojiEstado(estadoDespensa)}</span>
        )}
      </motion.button>

      {onDespensa && (
        <>
          <button
            onClick={() => setMostrarSemaforo((v) => !v)}
            className={`w-full text-[10px] py-1.5 rounded-lg transition-colors font-medium ${
              enDespensa
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                : "bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700"
            }`}
          >
            🏠 {enDespensa ? `${emojiEstado(estadoDespensa)} Stock` : "Stock"}
          </button>

          <AnimatePresence>
            {mostrarSemaforo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-10 left-0 right-0 z-20 bg-zinc-800 border border-zinc-700 rounded-xl p-2 flex flex-col gap-1 shadow-xl"
              >
                {ESTADOS.map((e) => (
                  <button
                    key={e.key}
                    onClick={() => { onDespensa(product, e.key); setMostrarSemaforo(false); }}
                    className="flex items-center gap-2 text-xs text-white hover:bg-zinc-700 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <span>{e.emoji}</span>
                    <span>{e.label}</span>
                  </button>
                ))}
                {enDespensa && (
                  <button
                    onClick={() => { onDespensa(product, "quitar"); setMostrarSemaforo(false); }}
                    className="flex items-center gap-2 text-xs text-red-400 hover:bg-zinc-700 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <span>❌</span>
                    <span>Quitar de despensa</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}