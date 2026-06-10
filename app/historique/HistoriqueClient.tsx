"use client";

import { useState } from "react";

type Historique = {
  id: number;
  type: string;
  description: string;
  utilisateur: string | null;
  created_at: string;
};

const filtres = [
  "Tout",
  "Transaction",
  "Transaction libre",
  "Blanchiment",
  "Stockage",
  "Membre",
  "Banque",
  "Organisation",
];

function getIcon(type: string) {
  switch (type.toLowerCase()) {
    case "blanchiment":
      return "🧼";
    case "stockage":
      return "📦";
    case "transaction":
      return "💰";
    case "transaction libre":
      return "📦";
    case "membre":
      return "👥";
    case "banque":
      return "🏦";
    case "organisation":
      return "⚙️";
    default:
      return "📜";
  }
}

export default function HistoriqueClient({
  historiques,
}: {
  historiques: Historique[];
}) {
  const [filtreActif, setFiltreActif] = useState("Tout");

  const historiquesFiltres =
    filtreActif === "Tout"
      ? historiques
      : historiques.filter((item) => item.type === filtreActif);

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-2">📜 Historique</h1>

      <p className="text-slate-400 mb-6">
        Journal centralisé des actions importantes
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        {filtres.map((filtre) => (
          <button
            key={filtre}
            onClick={() => setFiltreActif(filtre)}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              filtreActif === filtre
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {filtre}
          </button>
        ))}
      </div>

      {historiquesFiltres.length === 0 ? (
        <div className="rounded-xl bg-slate-800 p-6 text-slate-400">
          Aucun événement pour ce filtre.
        </div>
      ) : (
        <div className="space-y-4">
          {historiquesFiltres.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-slate-800 p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {getIcon(item.type)} {item.type}
                  </h2>

                  <p className="mt-2 whitespace-pre-line text-slate-300">
                    {item.description}
                  </p>

                  {item.utilisateur && (
                    <p className="mt-3 text-sm text-slate-500">
                      Utilisateur : {item.utilisateur}
                    </p>
                  )}
                </div>

                <p className="whitespace-nowrap text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}