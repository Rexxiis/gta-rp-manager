"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type UserData = {
  nom: string;
  grade: string;
};

export default function UserInfo() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return;

      const { data: membre } = await supabase
        .from("membres")
        .select("nom, grade")
        .eq("email", user.email)
        .single();

      if (!membre) return;

      setUserData({
        nom: membre.nom,
        grade: membre.grade,
      });
    }

    loadUser();
  }, []);

  return (
    <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm text-slate-400">
        Utilisateur connecté
      </p>

      <p className="mt-2 text-lg font-semibold">
        👤 {userData?.nom || "Chargement..."}
      </p>

      <p className="text-sm text-slate-400">
        🎖️ {userData?.grade || "-"}
      </p>
    </div>
  );
}