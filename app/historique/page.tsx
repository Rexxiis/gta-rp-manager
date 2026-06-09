import { supabase } from "../../lib/supabase";

export default async function HistoriquePage() {
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

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
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        📜 Historique
      </h1>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4">
                Date
              </th>

              <th className="text-left p-4">
                Argent propre
              </th>

              <th className="text-left p-4">
                Argent sale
              </th>

              <th className="text-left p-4">
                Total
              </th>

              <th className="text-left p-4">
                Note
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-slate-700"
              >
                <td className="p-4">
                  {new Date(
                    transaction.created_at
                  ).toLocaleString("fr-FR")}
                </td>

                <td className="p-4">
                  {transaction.total_propre.toLocaleString()} $
                </td>

                <td className="p-4">
                  {transaction.total_sale.toLocaleString()} $
                </td>

                <td className="p-4 font-bold">
                  {transaction.total_general.toLocaleString()} $
                </td>

                <td className="p-4">
                  {transaction.note || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}