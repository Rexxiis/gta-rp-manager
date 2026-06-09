import { supabase } from "../../lib/supabase";
import BanquesClient from "./BanquesClient";

export default async function BanquesPage() {
  const { data: membres, error } = await supabase
    .from("membres")
    .select("id, nom, grade, compte, banque")
    .order("banque", { ascending: false });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-8">🏦 Comptes Bancaires</h1>
        <p className="text-red-400">Erreur Supabase : {error.message}</p>
      </main>
    );
  }

  return <BanquesClient membres={membres || []} />;
}