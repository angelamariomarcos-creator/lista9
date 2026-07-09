"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";

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
  onDespensa?: (product: Product) => void;
  isAdding?: boolean;
  enDespensa?: boolean;
};

export default function ProductCard({ product, onAdd, onDespensa, isAdding, enDespensa }: ProductCardProps) {
  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onAdd(product)}
        disabled={isAdding}
        className={`w-full flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-900 border transition-colors p-3 min-h-[88px] text-center disabled:opacity-50 ${
          enDespensa ? "border-blue-600" : "border-zinc-800 hover:border-emerald-600"
        }`}
      >
        <span className="text-3xl">{product.emoji}</span>
        <span className={`text-xs leading-tight ${enDespensa ? "text-blue-400" : "text-zinc-300"}`}>
          {product.nombre}
        </span>
        {enDespensa && (
          <span className="text-[9px] text-blue-500">en casa</span>
        )}
      </motion.button>

      {onDespensa && (
        <button
          onClick={(e) => { e.stopPropagation(); onDespensa(product); }}
          className={`absolute top-1 right-1 p-1 rounded-md transition-colors ${
            enDespensa
              ? "text-blue-400 hover:text-blue-300"
              : "text-zinc-600 hover:text-blue-400"
          }`}
          title={enDespensa ? "Quitar de despensa" : "Tengo en casa"}
        >
          <Home size={12} />
        </button>
      )}
    </div>
  );
}