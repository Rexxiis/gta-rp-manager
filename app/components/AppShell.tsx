"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import LogoutButton from "./LogoutButton";
import UserInfo from "./UserInfo";

const menuItems = [
  { name: "📊 Dashboard", href: "/dashboard" },
  { name: "👥 Effectifs", href: "/effectifs" },
  { name: "🏦 Banques", href: "/banques" },
  { name: "📦 Stockages", href: "/stockages" },
  { name: "🤝 Groupes", href: "/groupes" },
  { name: "💰 Transactions", href: "/transactions" },
  { name: "🧼 Blanchiment", href: "/blanchiment" },
  { name: "📜 Historique", href: "/historique" },
  { name: "⚙️ Organisation", href: "/organisation" },
];

type Organisation = {
  nom: string;
  logo_url: string | null;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organisation, setOrganisation] = useState<Organisation>({
    nom: "GTA RP Manager",
    logo_url: null,
  });

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

      const { data } = await supabase
        .from("organisation")
        .select("nom, logo_url")
        .order("id", { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setOrganisation({
          nom: data.nom,
          logo_url: data.logo_url,
        });
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
        <div className="mb-6 flex flex-col items-center text-center">
          {organisation.logo_url ? (
            <img
  src={organisation.logo_url}
  alt={organisation.nom}
  className="mb-3 h-20 w-20 rounded-xl object-cover bg-slate-800"
            />
          ) : (
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              Logo
            </div>
          )}

          <h1 className="text-xl font-bold break-words">{organisation.nom}</h1>
        </div>

        <UserInfo />

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