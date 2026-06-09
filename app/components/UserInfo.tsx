"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UserInfo() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="mb-6 rounded-xl bg-slate-800 p-4 border border-slate-700">
      <p className="text-sm text-slate-400">
        Utilisateur connecté
      </p>

      <p className="mt-1 font-semibold">
        👤 {email}
      </p>
    </div>
  );
}