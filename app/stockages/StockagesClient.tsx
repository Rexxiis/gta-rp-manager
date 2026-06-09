"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Appartement = {
  id: number;
  code: string;
  type: string;
  argent_sale: number;
  valeur_stock: number;
};

export default function StockagesClient({
  appartements,
}: {
  appartements: Appartement[];
}) {
  const [liste, setListe] = useState(appartements);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function sauvegarder(appartement: Appartement) {
    setSavingId(appartement.id);

    const { error } = await supabase
      .from("appartements")
      .update({
        argent_sale: appartement.argent_sale,
        valeur_stock: appartement.valeur_stock,
      })
      .eq("id", appartement.id);

    setSavingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Stockage sauvegardé !");
  }

  const totalArgentSale = liste.reduce(
    (total, a) => total + Number(a.argent_sale || 0),
    0
  );

  const totalValeurStock = liste.reduce(
    (total, a) => total + Number(a.valeur_stock || 0),
    0
  );

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        📦 Stockages
      </h1>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-4 text-left">Appartement</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Argent sale</th>
              <th className="p-4 text-left">Valeur stock</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {liste.map((appartement) => (
              <tr
                key={appartement.id}
                className="border-t border-slate-700"
              >
                <td className="p-4">
                  {appartement.code}
                </td>

                <td className="p-4">
                  {appartement.type}
                </td>

                <td className="p-4">
                  <input
                    type="number"
                    className="w-40 rounded bg-slate-700 p-2"
                    value={appartement.argent_sale}
                    onChange={(e) =>
                      setListe((ancienne) =>
                        ancienne.map((a) =>
                          a.id === appartement.id
                            ? {
                                ...a,
                                argent_sale: Number(
                                  e.target.value
                                ),
                              }
                            : a
                        )
                      )
                    }
                  />
                </td>

                <td className="p-4">
                  <input
                    type="number"
                    className="w-40 rounded bg-slate-700 p-2"
                    value={appartement.valeur_stock}
                    onChange={(e) =>
                      setListe((ancienne) =>
                        ancienne.map((a) =>
                          a.id === appartement.id
                            ? {
                                ...a,
                                valeur_stock: Number(
                                  e.target.value
                                ),
                              }
                            : a
                        )
                      )
                    }
                  />
                </td>

                <td className="p-4">
                  <button
                    onClick={() =>
                      sauvegarder(appartement)
                    }
                    disabled={
                      savingId === appartement.id
                    }
                    className="rounded bg-blue-600 px-4 py-2"
                  >
                    {savingId === appartement.id
                      ? "Sauvegarde..."
                      : "Sauvegarder"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="font-bold text-xl">
            💵 Argent sale total
          </h2>

          <p className="text-3xl font-bold mt-2">
            {totalArgentSale.toLocaleString()} $
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="font-bold text-xl">
            📦 Valeur totale des stocks
          </h2>

          <p className="text-3xl font-bold mt-2">
            {totalValeurStock.toLocaleString()} $
          </p>
        </div>
      </div>
    </main>
  );
}