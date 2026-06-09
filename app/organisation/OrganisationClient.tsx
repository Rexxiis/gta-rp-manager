"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Organisation = {
  id: number;
  nom: string;
  logo_url: string | null;
};

export default function OrganisationClient({
  organisation,
}: {
  organisation: Organisation;
}) {
  const [nom, setNom] = useState(organisation.nom);
  const [logoUrl, setLogoUrl] = useState(organisation.logo_url || "");

  async function sauvegarder() {
    const { error } = await supabase
      .from("organisation")
      .update({
        nom,
        logo_url: logoUrl || null,
      })
      .eq("id", organisation.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Organisation sauvegardée !");
  }

  async function uploadLogo(file: File) {
    const extension = file.name.split(".").pop();
    const fileName = `organisation-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("logos")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);

    setLogoUrl(data.publicUrl);
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">⚙️ Organisation</h1>

      <div className="max-w-xl rounded-xl bg-slate-800 p-6 border border-slate-700">
        <label className="block mb-2 text-slate-300">
          Nom de l'organisation
        </label>

        <input
          className="mb-6 w-full rounded bg-slate-700 p-3"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <label className="block mb-2 text-slate-300">
          Logo de l'organisation
        </label>

        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo organisation"
            className="mb-4 h-28 w-28 rounded-xl object-cover bg-slate-900"
          />
        ) : (
          <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-xl bg-slate-900 text-slate-500">
            Logo
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="mb-6 w-full rounded bg-slate-700 p-3"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadLogo(file);
          }}
        />

        <button
          onClick={sauvegarder}
          className="rounded bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
        >
          Sauvegarder
        </button>
      </div>
    </main>
  );
}