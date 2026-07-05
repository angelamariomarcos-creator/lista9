"use client";

import { usePathname } from "next/navigation";
import { ShoppingCart, Home, Receipt, User } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function BottomNav() {
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-800 flex items-center justify-around px-2 py-2">
      <a href="/" className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${pathname === "/" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
        <Home size={22} />
        <span className="text-[10px]">Inicio</span>
      </a>
      <a href="/cesta" className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${pathname === "/cesta" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
        <ShoppingCart size={22} />
        <span className="text-[10px]">Cesta</span>
      </a>
      <a href="/gastos" className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${pathname === "/gastos" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
        <Receipt size={22} />
        <span className="text-[10px]">Gastos</span>
      </a>
      {email ? (
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-4 py-1 text-zinc-500 hover:text-white transition-colors">
          <User size={22} />
          <span className="text-[10px]">Salir</span>
        </button>
      ) : (
        <a href="/login" className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${pathname === "/login" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
          <User size={22} />
          <span className="text-[10px]">Entrar</span>
        </a>
      )}
    </nav>
  );
}