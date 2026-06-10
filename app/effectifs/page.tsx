export const dynamic = "force-dynamic";
import { supabase } from "../../lib/supabase";
import EffectifsClient from "./EffectifsClient";

export default async function EffectifsPage() {
  const { data: membres, error: membresError } = await supabase
    .from("membres")
    .select("*")
    .order("id", { ascending: true });

  const { data: appartements, error: appartementsError } = await supabase
    .from("appartements")
    .select("code, code_acces")
    .order("code", { ascending: true });

  if (membresError) {
    return (
      <main className="p-8 text-red-400">
        Erreur membres : {membresError.message}
      </main>
    );
  }

  if (appartementsError) {
    return (
      <main className="p-8 text-red-400">
        Erreur appartements : {appartementsError.message}
      </main>
    );
  }

  return (
    <EffectifsClient
      membres={membres || []}
      appartements={appartements || []}
    />
  );
}