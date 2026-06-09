import { supabase } from "../../lib/supabase";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const { data: groupes, error } = await supabase
    .from("groupes")
    .select(`
      id,
      nom,
      activite,
      produits (
        id,
        groupe_id,
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

  return <TransactionsClient groupes={groupes || []} />;
}