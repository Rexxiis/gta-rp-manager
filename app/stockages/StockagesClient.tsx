"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type StockItem = {
  id: number;
  nom: string;
  quantite: number;
  prix_unitaire: number | null;
};

type Appartement = {
  id: number;
  code: string;
  code_acces: string | null;
  proprietaire: string | null;
  type: string;
  argent_sale: number;
  stock_items: StockItem[];
};

export default function StockagesClient({
  appartements,
}: {
  appartements: Appartement[];
}) {
  const [liste, setListe] = useState(appartements);
  const [editing, setEditing] = useState<Appartement | null>(null);

  function valeurStock(appartement: Appartement) {
    return appartement.stock_items.reduce((total, item) => {
      if (!item.prix_unitaire) return total;
      return total + item.quantite * item.prix_unitaire;
    }, 0);
  }

  function objetsSansPrix(appartement: Appartement) {
    return appartement.stock_items.filter((item) => !item.prix_unitaire).length;
  }

  const totalArgentSale = liste.reduce(
    (total, appartement) => total + Number(appartement.argent_sale || 0),
    0
  );

  const totalValeurStock = liste.reduce(
    (total, appartement) => total + valeurStock(appartement),
    0
  );

  async function sauvegarder() {
    if (!editing) return;

    const { error } = await supabase
      .from("appartements")
      .update({
        code_acces: editing.code_acces,
        argent_sale: editing.argent_sale,
      })
      .eq("id", editing.id);

    if (error) {
      alert(error.message);
      return;
    }

    for (const item of editing.stock_items) {
      const { error: itemError } = await supabase
        .from("stock_items")
        .update({
          nom: item.nom,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
        })
        .eq("id", item.id);

      if (itemError) {
        alert(itemError.message);
        return;
      }
    }

    setListe((ancienne) =>
      ancienne.map((appartement) =>
        appartement.id === editing.id ? editing : appartement
      )
    );

    setEditing(null);
  }

  async function ajouterObjet() {
    if (!editing) return;

    const { data, error } = await supabase
      .from("stock_items")
      .insert({
        appartement_id: editing.id,
        nom: "Nouvel objet",
        quantite: 0,
        prix_unitaire: null,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setEditing({
      ...editing,
      stock_items: [...editing.stock_items, data],
    });
  }

  async function supprimerObjet(id: number) {
    if (!editing) return;
    if (!confirm("Supprimer cet objet du stock ?")) return;

    const { error } = await supabase
      .from("stock_items")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing({
      ...editing,
      stock_items: editing.stock_items.filter((item) => item.id !== id),
    });
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">📦 Stockages</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl bg-slate-800 p-6">
          <p className="text-slate-400">💵 Argent sale total</p>
          <p className="text-3xl font-bold mt-2">
            {totalArgentSale.toLocaleString()} $
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6">
          <p className="text-slate-400">📦 Valeur stock total</p>
          <p className="text-3xl font-bold mt-2">
            {totalValeurStock.toLocaleString()} $
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6">
          <p className="text-slate-400">🏠 Appartements</p>
          <p className="text-3xl font-bold mt-2">{liste.length}</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
        {liste.map((appartement) => (
          <div key={appartement.id} className="rounded-xl bg-slate-800 p-6">
            <div className="mb-4">
<h2 className="text-2xl font-bold">🏠 {appartement.code}</h2>
<p className="text-slate-400">🔑 {appartement.code_acces || "-"}</p>
<p className="text-slate-400">👤 {appartement.proprietaire || "Aucun"}</p>
<p className="text-slate-400">📦 {appartement.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-slate-700 p-4">
                <p className="text-slate-300">💵 Argent sale</p>
                <p className="text-xl font-bold">
                  {appartement.argent_sale.toLocaleString()} $
                </p>
              </div>

              <div className="rounded-lg bg-slate-700 p-4">
                <p className="text-slate-300">📦 Stock</p>
                <p className="text-xl font-bold">
                  {valeurStock(appartement).toLocaleString()} $
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {appartement.stock_items.length === 0 ? (
                <p className="text-slate-400">Aucun objet.</p>
              ) : (
                appartement.stock_items.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between rounded bg-slate-900 p-3"
                  >
                    <span>{item.nom}</span>
                    <span>
                      x{item.quantite}
                      {!item.prix_unitaire && (
                        <span className="ml-2 text-yellow-400">⚠️</span>
                      )}
                    </span>
                  </div>
                ))
              )}

              {objetsSansPrix(appartement) > 0 && (
                <p className="text-sm text-yellow-400">
                  ⚠️ {objetsSansPrix(appartement)} objet(s) sans prix
                </p>
              )}
            </div>

            <button
              onClick={() => setEditing(appartement)}
              className="w-full rounded bg-blue-600 px-4 py-3 hover:bg-blue-500"
            >
              ✏️ Modifier
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold mb-6">
              ✏️ Modifier {editing.code}
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                className="rounded bg-slate-800 p-3"
                placeholder="Code accès"
                value={editing.code_acces || ""}
                onChange={(e) =>
                  setEditing({ ...editing, code_acces: e.target.value })
                }
              />

              <input
                type="number"
                className="rounded bg-slate-800 p-3"
                placeholder="Argent sale"
                value={editing.argent_sale}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    argent_sale: Number(e.target.value),
                  })
                }
              />
            </div>

            <h3 className="text-xl font-bold mb-4">📦 Objets stockés</h3>

            <div className="space-y-3">
              {editing.stock_items.map((item) => (
                <div
                  key={item.id}
                  className="grid md:grid-cols-4 gap-3 rounded bg-slate-800 p-3"
                >
                  <input
                    className="rounded bg-slate-700 p-2"
                    value={item.nom}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        stock_items: editing.stock_items.map((i) =>
                          i.id === item.id ? { ...i, nom: e.target.value } : i
                        ),
                      })
                    }
                  />

                  <input
                    type="number"
                    className="rounded bg-slate-700 p-2"
                    value={item.quantite}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        stock_items: editing.stock_items.map((i) =>
                          i.id === item.id
                            ? { ...i, quantite: Number(e.target.value) }
                            : i
                        ),
                      })
                    }
                  />

                  <input
                    type="number"
                    className="rounded bg-slate-700 p-2"
                    placeholder="Prix optionnel"
                    value={item.prix_unitaire ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        stock_items: editing.stock_items.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                prix_unitaire:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              }
                            : i
                        ),
                      })
                    }
                  />

                  <button
                    onClick={() => supprimerObjet(item.id)}
                    className="rounded bg-red-600 px-3 py-2 hover:bg-red-500"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={ajouterObjet}
              className="mt-4 rounded bg-slate-700 px-4 py-3 hover:bg-slate-600"
            >
              ➕ Ajouter un objet
            </button>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded bg-slate-700 px-5 py-3 hover:bg-slate-600"
              >
                Annuler
              </button>

              <button
                onClick={sauvegarder}
                className="rounded bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}