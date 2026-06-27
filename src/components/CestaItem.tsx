"use client";

import { motion } from "framer-motion";
import { Trash2, Check } from "lucide-react";

type CestaItemData = {
  id: string;
  comentario_ia: string | null;
  comprado: boolean;
  products: {
    nombre: string;
    emoji: string;
  } | null;
};

type CestaItemProps = {
  item: CestaItemData;
  nombreAnadido?: string;
  onRemove: (id: string) => void;
  onToggle: (id: string, comprado: boolean) => void;
};

const COLORES_AVATAR: Record<string, string> = {
  Javi: "bg-emerald-600",
  Vanesa: "bg-pink-500",
  Vane: "bg-pink-500",
  Angela: "bg-purple-500",
  Mario: "bg-blue-500",
  Marcos: "bg-amber-500",
};

function colorParaNombre(nombre: string): string {
  return COLORES_AVATAR[nombre] ?? "bg-zinc-600";
}

export default function CestaItem({ item, nombreAnadido, onRemove, onToggle }: CestaItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 p-3"
    >
      <button
        onClick={() => onToggle(item.id, !item.comprado)}
        className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
          item.comprado
            ? "bg-emerald-600 border-emerald-600"
            : "border-zinc-600 hover:border-emerald-500"
        }`}
        aria-label="Marcar como comprado"
      >
        {item.comprado && <Check size={14} className="text-white" />}
      </button>

      <span className="text-2xl">{item.products?.emoji ?? "🛒"}</span>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            item.comprado ? "text-zinc-500 line-through" : "text-white"
          }`}
        >
          {item.products?.nombre ?? "Producto"}
        </p>
        {item.comentario_ia && (
          <p
            className={`text-xs italic leading-snug mt-0.5 ${
              item.comprado ? "text-zinc-600 line-through" : "text-zinc-400"
            }`}
          >
            {item.comentario_ia}
          </p>
        )}
      </div>

      {nombreAnadido && (
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full ${colorParaNombre(nombreAnadido)} flex items-center justify-center text-[10px] font-semibold text-white`}
          title={`Añadido por ${nombreAnadido}`}
        >
          {nombreAnadido.charAt(0).toUpperCase()}
        </div>
      )}

      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
        aria-label="Eliminar"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}