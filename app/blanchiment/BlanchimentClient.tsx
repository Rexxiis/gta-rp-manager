"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Blanchiment = {
  id: number;
  montant_sale: number;
  taux: number;
  montant_propre: number;
  note: string | null;
  created_at: string;
};

async function getNomUtilisateur() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "Inconnu";

  const { data: profil } = await supabase
    .from("profils")
    .select("membre_id")
    .eq("id", user.id)
    .single();

  if (!profil?.membre_id) return "Inconnu";

  const { data: membre } = await supabase
    .from("membres")
    .select("nom")
    .eq("id", profil.membre_id)
    .single();

  return membre?.nom || "Inconnu";
}

export default function BlanchimentClient({
  historiques,
}: {
  historiques: Blanchiment[];
}) {
  const [montantSale, setMontantSale] = useState(0);
  const [taux, setTaux] = useState(75);
  const [note, setNote] = useState("");
  const [liste, setListe] = useState(historiques);

  const montantPropre = Math.floor((montantSale * taux) / 100);

  async function enregistrer() {
    if (montantSale <= 0) {
      alert("Entre un montant valide.");
      return;
    }

    const utilisateur = await getNomUtilisateur();

    const { data, error } = await supabase
      .from("blanchiments")
      .insert({
        montant_sale: montantSale,
        taux,
        montant_propre: montantPropre,
        note,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setListe([data, ...liste]);

    await supabase.from("historique").insert({
      type: "Blanchiment",
      utilisateur,
      description:
        `${montantSale.toLocaleString()} $ argent sale\n` +
        `↓\n` +
        `${montantPropre.toLocaleString()} $ argent propre\n` +
        `Taux : ${taux}%`,
    });

    setMontantSale(0);
    setTaux(75);
    setNote("");
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">🧼 Blanchiment</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Nouvelle opération</h2>

          <label className="block mb-2 text-slate-300">
            Montant argent sale
          </label>
          <input
            type="number"
            className="mb-4 w-full rounded bg-slate-700 p-3"
            value={montantSale}
            onChange={(e) => setMontantSale(Number(e.target.value))}
          />

          <label className="block mb-2 text-slate-300">
            Taux de blanchiment (%)
          </label>
          <input
            type="number"
            className="mb-4 w-full rounded bg-slate-700 p-3"
            value={taux}
            onChange={(e) => setTaux(Number(e.target.value))}
          />

          <div className="mb-4 rounded-lg bg-slate-900 p-4">
            <p className="text-slate-400">Résultat argent propre</p>
            <p className="text-3xl font-bold">
              {montantPropre.toLocaleString()} $
            </p>
          </div>

          <textarea
            className="mb-4 w-full rounded bg-slate-700 p-3"
            placeholder="Note optionnelle..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            onClick={enregistrer}
            className="w-full rounded bg-green-600 p-3 font-semibold hover:bg-green-500"
          >
            Enregistrer
          </button>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Historique</h2>

          {liste.length === 0 ? (
            <p className="text-slate-400">Aucune opération enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {liste.map((item) => (
                <div key={item.id} className="rounded bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">
                    {new Date(item.created_at).toLocaleString("fr-FR")}
                  </p>

                  <p className="mt-2">
                    💵 Sale : {item.montant_sale.toLocaleString()} $
                  </p>
                  <p>Taux : {item.taux} %</p>
                  <p className="font-bold">
                    💰 Propre : {item.montant_propre.toLocaleString()} $
                  </p>

                  {item.note && (
                    <p className="mt-2 text-slate-400">{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}