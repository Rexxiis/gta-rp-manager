import { supabase } from "./supabase";

export async function getCurrentProfil() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profils")
    .select("personnage, role")
    .eq("id", user.id)
    .single();

  return data;
}