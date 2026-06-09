import { supabase } from "../../lib/supabase";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const { data: groupes, error } = await supabase
    .from("groupes")
    .select(`
      id,
      nom,
      activite,
      actif,
      produits (
        id,
        groupe_id,
        nom,
        type,
        prix,
        monnaie,
        actif
      )
    `)
    .eq("actif", true)
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  const groupesFiltres = (groupes || []).map((groupe) => ({
    ...groupe,
    produits: (groupe.produits || []).filter(
      (produit) => produit.actif !== false
    ),
  }));

  return <TransactionsClient groupes={groupesFiltres} />;
}