import { supabase } from "../../lib/supabase";
import GroupesClient from "./GroupesClient";

export default async function GroupesPage() {
  const { data, error } = await supabase
    .from("groupes")
    .select(`
      id,
      nom,
      activite,
      logo_url,
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
        <p className="text-red-400">
          Erreur : {error.message}
        </p>
      </main>
    );
  }

  return (
    <GroupesClient
      groupes={(data || []).map((groupe) => ({
        ...groupe,
        produits: (groupe.produits || []).filter(
          (produit) => produit.actif !== false
        ),
      }))}
    />
  );
}