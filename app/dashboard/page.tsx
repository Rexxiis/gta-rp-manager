import { supabase } from "../../lib/supabase";

type Membre = {
  id: number;
  present: boolean;
  banque: number;
};

type Appartement = {
  id: number;
  argent_sale: number;
  valeur_stock: number;
};

export default async function DashboardPage() {
  const { data: membres } = await supabase
    .from("membres")
    .select("id, present, banque");

  const { data: appartements } = await supabase
    .from("appartements")
    .select("id, argent_sale, valeur_stock");

  const argentPropre = (membres as Membre[] || []).reduce(
    (total, membre) => total + Number(membre.banque || 0),
    0
  );

  const argentSale = (appartements as Appartement[] || []).reduce(
    (total, appartement) => total + Number(appartement.argent_sale || 0),
    0
  );

  const valeurStocks = (appartements as Appartement[] || []).reduce(
    (total, appartement) => total + Number(appartement.valeur_stock || 0),
    0
  );

  const membresPresents = (membres as Membre[] || []).filter(
    (membre) => membre.present
  ).length;

  const totalMembres = (membres as Membre[] || []).length;

  const patrimoine = argentPropre + argentSale + valeurStocks;

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">📊 Tableau de bord</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-slate-400 mb-2">Argent propre</h2>
          <p className="text-3xl font-bold">
            {argentPropre.toLocaleString()} $
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-slate-400 mb-2">Argent sale</h2>
          <p className="text-3xl font-bold">
            {argentSale.toLocaleString()} $
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-slate-400 mb-2">Valeur des stocks</h2>
          <p className="text-3xl font-bold">
            {valeurStocks.toLocaleString()} $
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-slate-400 mb-2">Patrimoine global</h2>
          <p className="text-3xl font-bold">
            {patrimoine.toLocaleString()} $
          </p>
        </div>
      </div>

      <div className="mt-8 bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">👥 Effectifs</h2>
        <p>
          Membres présents : <strong>{membresPresents} / {totalMembres}</strong>
        </p>
      </div>
    </main>
  );
}