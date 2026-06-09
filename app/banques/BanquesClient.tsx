"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Membre = {
  id: number;
  nom: string;
  grade: string;
  compte: string | null;
  banque: number;
};

export default function BanquesClient({
  membres,
}: {
  membres: Membre[];
}) {
  const [liste, setListe] = useState(membres);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function updateBanque(id: number, banque: number) {
    setSavingId(id);

    const { error } = await supabase
      .from("membres")
      .update({ banque })
      .eq("id", id);

    setSavingId(null);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    alert("Solde sauvegardé !");
  }

  const totalBanque = liste.reduce(
    (total, membre) => total + Number(membre.banque || 0),
    0
  );

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">🏦 Comptes Bancaires</h1>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Grade</th>
              <th className="text-left p-4">Compte</th>
              <th className="text-left p-4">Solde</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {liste.map((membre) => (
              <tr key={membre.id} className="border-t border-slate-700">
                <td className="p-4">{membre.nom}</td>
                <td className="p-4">{membre.grade}</td>
                <td className="p-4">{membre.compte}</td>
                <td className="p-4">
                  <input
                    type="number"
                    className="w-40 rounded bg-slate-700 p-2"
                    value={membre.banque}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      setListe((ancienneListe) =>
                        ancienneListe.map((item) =>
                          item.id === membre.id
                            ? { ...item, banque: value }
                            : item
                        )
                      );
                    }}
                  />
                  <span className="ml-2">$</span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => updateBanque(membre.id, membre.banque)}
                    disabled={savingId === membre.id}
                    className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500 disabled:opacity-50"
                  >
                    {savingId === membre.id ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold">💰 Total Argent Propre</h2>
        <p className="text-3xl font-bold mt-2">
          {totalBanque.toLocaleString()} $
        </p>
      </div>
    </main>
  );
}