"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  async function connexion() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  async function motDePasseOublie() {
    if (!email) {
      alert("Entre ton email avant de demander la réinitialisation.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Email de réinitialisation envoyé.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 border border-slate-700">
        <h1 className="text-3xl font-bold mb-2">Connexion</h1>
        <p className="text-slate-400 mb-6">GTA RP Manager</p>

        <input
          className="mb-4 w-full rounded bg-slate-800 p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-4 w-full rounded bg-slate-800 p-3"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="mb-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Rester connecté
        </label>

        <button
          onClick={connexion}
          className="w-full rounded bg-blue-600 p-3 font-semibold hover:bg-blue-500"
        >
          Se connecter
        </button>

        <button
          onClick={motDePasseOublie}
          className="mt-4 w-full text-sm text-slate-400 hover:text-white"
        >
          Mot de passe oublié ?
        </button>
      </div>
    </main>
  );
}