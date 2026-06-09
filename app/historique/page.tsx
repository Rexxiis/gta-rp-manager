import { supabase } from "../../lib/supabase";

type Historique = {
  id: number;
  type: string;
  description: string;
  utilisateur: string | null;
  created_at: string;
};

function getIcon(type: string) {
  switch (type.toLowerCase()) {
    case "blanchiment":
      return "🧼";
    case "stockage":
      return "📦";
    case "transaction":
      return "💰";
    case "membre":
      return "👥";
    case "banque":
      return "🏦";
    default:
      return "📜";
  }
}

export default async function HistoriquePage() {
  const { data, error } = await supabase
    .from("historique")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8 text-red-400">
        Erreur : {error.message}
      </main>
    );
  }

  const historiques = (data || []) as Historique[];

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-2">📜 Historique</h1>
      <p className="text-slate-400 mb-8">
        Journal centralisé des actions importantes
      </p>

      {historiques.length === 0 ? (
        <div className="rounded-xl bg-slate-800 p-6 text-slate-400">
          Aucun événement enregistré.
        </div>
      ) : (
        <div className="space-y-4">
          {historiques.map((item) => (
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