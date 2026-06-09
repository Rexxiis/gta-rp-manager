import { supabase } from "../../lib/supabase";

type Membre = {
  id: number;
  nom: string;
  grade: string;
  present: boolean;
  telephone: string | null;
  compte: string | null;
  appartement: string | null;
};

export default async function EffectifsPage() {
  const { data: membres, error } = await supabase
    .from("membres")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-8">👥 Effectifs</h1>
        <p className="text-red-400">
          Erreur Supabase : {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">👥 Effectifs</h1>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Grade</th>
              <th className="text-left p-4">Présent</th>
              <th className="text-left p-4">Téléphone</th>
              <th className="text-left p-4">Compte</th>
              <th className="text-left p-4">Appartement</th>
            </tr>
          </thead>

          <tbody>
            {(membres as Membre[]).map((membre) => (
              <tr key={membre.id} className="border-t border-slate-700">
                <td className="p-4">{membre.nom}</td>
                <td className="p-4">{membre.grade}</td>
                <td className="p-4">{membre.present ? "✅" : "❌"}</td>
                <td className="p-4">{membre.telephone}</td>
                <td className="p-4">{membre.compte}</td>
                <td className="p-4">{membre.appartement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}