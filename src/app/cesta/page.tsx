"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import CestaItem from "@/components/CestaItem";
import SeniorRexReaction from "@/components/SeniorRexReaction";

type CestaRow = {
  id: string;
  comentario_ia: string | null;
  comprado: boolean;
  anadido_por: string | null;
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
  const [miembros, setMiembros] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [rexTrigger, setRexTrigger] = useState(0);
  const [vaciando, setVaciando] =