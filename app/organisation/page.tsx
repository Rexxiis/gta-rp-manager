export const dynamic = "force-dynamic";
import { supabase } from "../../lib/supabase";
import OrganisationClient from "./OrganisationClient";

export default async function OrganisationPage() {
  const { data, error } = await supabase
    .from("organisation")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return <main className="p-8 text-red-400">{error.message}</main>;
  }

  return <OrganisationClient organisation={data} />;
}