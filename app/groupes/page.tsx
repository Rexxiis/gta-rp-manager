import { supabase } from "../../lib/supabase";

type Produit = {
  id: number;
  nom: string;
  type: string;
  prix: number;
  monnaie: "propre" | "sale";
};

type Groupe = {
  id: number;
  nom: string;
  activite: string;
  produits: Produit[];
};

export default async function GroupesPage() {
  const { data: groupes, error } = await supabase
    .from("groupes")
    .select(`
      id,
      nom,
      activite,
      produits (
        id,
        nom,
        type,
        prix,
        monnaie
      )
    `)
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">🤝 Groupes</h1>

      <div className="space-y-6">
        {(groupes as Groupe[]).map((groupe) => (
          <div key={groupe.id} className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold">{groupe.nom}</h2>
            <p className="text-slate-400 mb-4">{groupe.activite}</p>

            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-2">Produit</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Prix unitaire</th>
                  <th className="pb-2">Paiement</th>
                </tr>
              </thead>

              <tbody>
                {groupe.produits.map((produit) => (
                  <tr key={produit.id} className="border-b border-slate-700">
                    <td className="py-3">{produit.nom}</td>
                    <td className="py-3">{produit.type}</td>
                    <td className="py-3">{produit.prix.toLocaleString()} $</td>
                    <td className="py-3">
                      {produit.monnaie === "sale"
                        ? "💵 Argent sale"
                        : "🏦 Argent propre"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </main>
  );
}