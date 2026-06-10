"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type Organisation = {
  nom: string;
  logo_url: string | null;
};

export default function LoginForm() {
  const router = useRouter();

  const [organisation, setOrganisation] =
    useState<Organisation | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    async function chargerOrganisation() {
      const { data } = await supabase
        .from("organisation")
        .select("nom, logo_url")
        .limit(1)
        .single();

      if (data) {
        setOrganisation(data);
      }
    }

    chargerOrganisation();
  }, []);

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
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-8">

        {organisation?.logo_url && (
          <div className="mb-6 flex justify-center">
            <img
              src={organisation.logo_url}
              alt={organisation.nom}
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
        )}

        <h1 className="mb-2 text-center text-3xl font-bold">
          {organisation?.nom || "Connexion"}
        </h1>

        <p className="mb-6 text-center text-slate-400">
          Gestion financière & logistique
        </p>

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