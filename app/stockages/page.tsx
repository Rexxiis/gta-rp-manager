export const dynamic = "force-dynamic";
import { supabase } from "../../lib/supabase";
import StockagesClient from "./StockagesClient";

export default async function StockagesPage() {
  const { data, error } = await supabase
    .from("appartements")
 .select(`
  id,
  code,
  code_acces,
  proprietaire,
  type,
  argent_sale,
  stock_items (
    id,
    nom,
    quantite,
    prix_unitaire
  )
`)
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="p-8 text-red-400">
        Erreur : {error.message}
      </main>
    );
  }

  return <StockagesClient appartements={data || []} />;
}