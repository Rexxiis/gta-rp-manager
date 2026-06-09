import { supabase } from "../../lib/supabase";
import StockagesClient from "./StockagesClient";

export default async function StockagesPage() {
  const { data, error } = await supabase
    .from("appartements")
    .select("*")
    .order("id");

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <StockagesClient
      appartements={data || []}
    />
  );
}