"use client";

import { usePathname } from "next/navigation";
import { ShoppingCart, Receipt, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function TopNav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2 group relative">
        <span className="font-brand text-lg font-extrabold tracking-wide text-white uppercase">Lista 9.0</span>
        <div className="absolute top-10 left-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
          🦖 La app de lista de la compra familiar con humor y tecnología real
        </div>
      </a>

      <div className="flex items-center gap-1">

        <a href="/cesta" className={`relative group flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === "/cesta" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
          <ShoppingCart size={20} />
          <span className="text-[9px] mt-0.5">Cesta</span>
          <div className="absolute top-10 right-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-52 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            🛒 Tu lista de la compra en tiempo real — se sincroniza al instante con el móvil de toda la familia
          </div>
        </a>

        <a href="/gastos" className={`relative group flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === "/gastos" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
          <Receipt size={20} />
          <span className="text-[9px] mt-0.5">Gastos</span>
          <div className="absolute top-10 right-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-52 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            📊 Sube tickets del supermercado y ve cuánto gastas al mes por categoría — con comentarios de Senior Rex
          </div>
        </a>

        {email ? (
          <button onClick={handleLogout} className="relative group flex flex-col items-center px-3 py-1 rounded-lg text-zinc-500 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="text-[9px] mt-0.5">Salir</span>
            <div className="absolute top-10 right-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-44 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              👋 Cerrar sesión — tu familia seguirá viendo la cesta
            </div>
          </button>
        ) : (
          <a href="/login" className={`relative group flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === "/login" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
            <User size={20} />
            <span className="text-[9px] mt-0.5">Entrar</span>
            <div className="absolute top-10 right-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 w-52 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              🔐 Login familiar con magic link — sin contraseñas, solo tu email y un click
            </div>
          </a>
        )}

      </div>
    </header>
  );
}



