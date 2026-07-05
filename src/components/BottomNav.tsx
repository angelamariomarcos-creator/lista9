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
      <a href="/" className="flex items-center gap-2">
        <span className="text-2xl">🦖</span>
        <span className="text-sm font-bold text-white">Lista 9.0</span>
      </a>

      <div className="flex items-center gap-1">
        <a href="/cesta" className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === "/cesta" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
          <ShoppingCart size={20} />
          <span className="text-[9px] mt-0.5">Cesta</span>
        </a>
        <a href="/gastos" className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === "/gastos" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
          <Receipt size={20} />
          <span className="text-[9px] mt-0.5">Gastos</span>
        </a>
        {email ? (
          <button onClick={handleLogout} className="flex flex-col items-center px-3 py-1 rounded-lg text-zinc-500 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="text-[9px] mt-0.5">Salir</span>
          </button>
        ) : (
          <a href="/login" className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === "/login" ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}>
            <User size={20} />
            <span className="text-[9px] mt-0.5">Entrar</span>
          </a>
        )}
      </div>
    </header>
  );
}