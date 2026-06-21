"use client";

import { motion } from "framer-motion";

type Product = {
  id: string;
  nombre: string;
  categoria: string;
  emoji: string;
};

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  isAdding?: boolean;
};

export default function ProductCard({ product, onAdd, isAdding }: ProductCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => onAdd(product)}
      disabled={isAdding}
      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-600 transition-colors p-3 min-h-[88px] text-center disabled:opacity-50"
    >
      <span className="text-3xl">{product.emoji}</span>
      <span className="text-xs text-zinc-300 leading-tight">{product.nombre}</span>
    </motion.button>
  );
}