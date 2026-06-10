export const dynamic = "force-dynamic";
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

type TransactionLibre = {
  id: number;
  type: string;
  description: string;
  montant: number;
  monnaie: "propre" | "sale";
  created_at: string;
};

type Activite = {
  id: number;
  type: string;
  description: string;
  created_at: string;
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

  const { data: transactionsLibresJour } = await supabase
    .from("transactions_libres")
    .select("id, montant")
    .gte("created_at", today.toISOString());

  const { data: blanchimentsJour } = await supabase
    .from("blanchiments")
    .select("id")
    .gte("created_at", today.toISOString());

  const { data: activites } = await supabase
    .from("historique")
    .select("id, type, description, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: derniersAchats } = await supabase
    .from("transactions_libres")
    .select("id, type, description, montant, monnaie, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

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
  const totalTransactionsJour = ((transactionsJour as { id: number }[]) || [])
    .length;
  const totalTransactionsLibresJour =
    ((transactionsLibresJour as { id: number; montant: number }[]) || [])
      .length;
  const totalBlanchimentsJour = ((blanchimentsJour as { id: number }[]) || [])
    .length;

  const montantTransactionsLibresJour = (
    (transactionsLibresJour as { id: number; montant: number }[]) || []
  ).reduce((total, item) => total + Number(item.montant || 0), 0);

  function iconeAchat(type: string) {
    if (type === "Véhicule") return "🚗";
    if (type === "Appartement") return "🏠";
    if (type === "Carte grise") return "📄";
    return "📦";
  }

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
          <p className="mt-3 text-3xl font-bold">{totalAppartements}</p>
          <p className="mt-2 text-sm text-slate-500">Stockages actifs</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">📜 Transactions groupe aujourd'hui</p>
          <p className="mt-3 text-3xl font-bold">{totalTransactionsJour}</p>
          <p className="mt-2 text-sm text-slate-500">
            Transactions groupe depuis minuit
          </p>
        </div>
      </div>

      <div className="mt-6 grid xl:grid-cols-3 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">📦 Transactions libres aujourd'hui</p>
          <p className="mt-3 text-3xl font-bold">
            {totalTransactionsLibresJour}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Total : {montantTransactionsLibresJour.toLocaleString()} $
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">🧼 Blanchiments aujourd'hui</p>
          <p className="mt-3 text-3xl font-bold">{totalBlanchimentsJour}</p>
          <p className="mt-2 text-sm text-slate-500">
            Opérations de blanchiment depuis minuit
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <p className="text-slate-400">📊 Activité du jour</p>
          <p className="mt-3 text-3xl font-bold">
            {totalTransactionsJour +
              totalTransactionsLibresJour +
              totalBlanchimentsJour}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Total opérations enregistrées
          </p>
        </div>
      </div>

      <div className="mt-8 grid xl:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">📜 Dernières activités</h2>

          {activites && activites.length > 0 ? (
            <div className="space-y-3">
              {(activites as Activite[]).map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-900 p-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">{item.type}</span>
                    <span className="text-sm text-slate-400">
                      {new Date(item.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Aucune activité récente.</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">🚗 Derniers achats libres</h2>

          {derniersAchats && derniersAchats.length > 0 ? (
            <div className="space-y-3">
              {(derniersAchats as TransactionLibre[]).map((achat) => (
                <div key={achat.id} className="rounded-lg bg-slate-900 p-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">
                      {iconeAchat(achat.type)} {achat.type}
                    </span>

                    <span className="text-sm text-slate-400">
                      {new Date(achat.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-300">{achat.description}</p>
                  <p className="mt-1 font-bold">
                    {achat.montant.toLocaleString()} ${" "}
                    {achat.monnaie === "sale" ? "💵 Sale" : "🏦 Propre"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Aucun achat libre récent.</p>
          )}
        </div>
      </div>
    </main>
  );
}