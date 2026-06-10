export const dynamic = "force-dynamic";
import { supabase } from "../../lib/supabase";
import HistoriqueClient from "./HistoriqueClient";

type Historique = {
  id: number;
  type: string;
  description: string;
  utilisateur: string | null;
  created_at: string;
};

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

  return <HistoriqueClient historiques={(data || []) as Historique[]} />;
}