import BlanchimentClient from "./BlanchimentClient";
import { supabase } from "../../lib/supabase";

export default async function BlanchimentPage() {
  const { data } = await supabase
    .from("blanchiments")
    .select("*")
    .order("created_at", { ascending: false });

  return <BlanchimentClient historiques={data || []} />;
}