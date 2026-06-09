"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import LogoutButton from "./LogoutButton";

const menuItems = [
  { name: "📊 Dashboard", href: "/dashboard" },
  { name: "👥 Effectifs", href: "/effectifs" },
  { name: "🏦 Banques", href: "/banques" },
  { name: "📦 Stockages", href: "/stockages" },
  { name: "🤝 Groupes", href: "/groupes" },
  { name: "💰 Transactions", href: "/transactions" },
  { name: "📈 Patrimoine", href: "/patrimoine" },
  { name: "🧼 Blanchiment", href: "/blanchiment" },
  { name: "📜 Historique", href: "/historique" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && !isLoginPage) {
        router.push("/login");
        return;
      }

      if (session && isLoginPage) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [pathname, router, isLoginPage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Vérification de la session...
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col bg-slate-900 border-r border-slate-800 p-6">
        <h1 className="text-2xl font-bold mb-8">GTA RP Manager</h1>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-3 rounded-lg hover:bg-slate-800 transition"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <LogoutButton />
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}