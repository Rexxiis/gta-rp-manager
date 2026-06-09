import { supabase } from "../../lib/supabase";

type Membre = {
  id: number;
  present: boolean;
  banque: number;
};

type Appartement = {
  id: number;
  argent_sale: number;
};

type StockItem = {
  id: number;
  quantite: number;
  prix_unitaire: number | null;
};

type Transaction = {
  id: number;
};

export default async function DashboardPage() {
  const { data: membres } = await supabase
    .from("membres")
    .select("id, present, banque");

  const { data: appartements } = await supabase
    .from("appartements")
    .select("id, argent_sale");

  const { data: stockItems } = await supabase
    .from("stock_items")
    .select("id, quantite, prix_unitaire");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: transactionsJour } = await supabase
    .from("transactions")
    .select("id")
    .gte("created_at", today.toISOString());

  const argentPropre = ((membres as Membre[]) || []).reduce(
    (total, membre) => total + Number(membre.banque || 0),
    0
  );

  const argentSale = ((appartements as Appartement[]) || []).reduce(
    (total, appartement) => total + Number(appartement.argent_sale || 0),
    0
  );

  const valeurMarchandises = ((stockItems as StockItem[]) || []).reduce(
    (total, item) => {
      if (!item.prix_unitaire) return total;
      return total + Number(item.quantite || 0) * Number(item.prix_unitaire);
    },
    0
  );

  const membresPresents = ((membres as Membre[]) || []).filter(
    (membre) => membre.present
  ).length;

  const totalMembres = ((membres as Membre[]) || []).length;
  const totalAppartements = ((appartements as Appartement[]) || []).length;
  const totalTransactionsJour =
    ((transactionsJour as Transaction[]) || []).length;

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">📊 Tableau de bord</h1>
        <p className="mt-2 text-slate-400">
          Vue globale de l'organisation
        </p>
      </div>

      <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">💰 Argent propre</p>
          <p className="mt-3 text-3xl font-bold">
            {argentPropre.toLocaleString()} $
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Comptes bancaires des membres
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">💵 Argent sale</p>
          <p className="mt-3 text-3xl font-bold">
            {argentSale.toLocaleString()} $
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Stocké dans les appartements
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">📦 Marchandises</p>
          <p className="mt-3 text-3xl font-bold">
            {valeurMarchandises.toLocaleString()} $
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Valeur calculée uniquement avec les prix connus
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">👥 Présents</p>
          <p className="mt-3 text-3xl font-bold">
            {membresPresents} / {totalMembres}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Membres actuellement cochés présents
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">🏠 Appartements</p>
          <p className="mt-3 text-3xl font-bold">
            {totalAppartements}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Stockages actifs
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">📜 Transactions aujourd'hui</p>
          <p className="mt-3 text-3xl font-bold">
            {totalTransactionsJour}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Transactions enregistrées depuis minuit
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-slate-800 p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-4">
          Séparation des ressources
        </h2>

        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="rounded-lg bg-slate-900 p-4">
            <p className="font-semibold text-white">💰 Argent propre</p>
            <p className="mt-2">
              Argent directement disponible sur les comptes bancaires.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-4">
            <p className="font-semibold text-white">💵 Argent sale</p>
            <p className="mt-2">
              Argent stocké séparément, non mélangé avec l'argent propre.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-4">
            <p className="font-semibold text-white">📦 Marchandises</p>
            <p className="mt-2">
              Valeur estimée selon les prix unitaires renseignés.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}