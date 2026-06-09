"use client";

import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={deconnexion}
      className="mt-auto rounded-lg bg-red-600 px-4 py-3 hover:bg-red-500"
    >
      🚪 Déconnexion
    </button>
  );
}