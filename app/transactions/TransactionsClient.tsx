"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Produit = {
  id: number;
  groupe_id: number;
  nom: string;
  type: string;
  prix: number;
  monnaie: "propre" | "sale";
};

type Groupe = {
  id: number;
  nom: string;
  activite: string;
  produits: Produit[];
};

type Ligne = {
  produit: Produit;
  quantite: number;
};

export default function TransactionsClient({
  groupes,
}: {
  groupes: Groupe[];
}) {
  const [groupeId, setGroupeId] = useState(groupes[0]?.id || 0);
  const [produitId, setProduitId] = useState<number>(0);
  const [quantite, setQuantite] = useState(1);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [note, setNote] = useState("");

  const groupe = groupes.find((g) => g.id === Number(groupeId));
  const produits = groupe?.produits || [];
  const produit = produits.find((p) => p.id === Number(produitId));

  function ajouterLigne() {
    if (!produit || quantite <= 0) return;

    setLignes((ancienne) => [
      ...ancienne,
      {
        produit,
        quantite,
      },
    ]);

    setProduitId(0);
    setQuantite(1);
  }

  function supprimerLigne(index: number) {
    setLignes((ancienne) => ancienne.filter((_, i) => i !== index));
  }

  const totalPropre = lignes
    .filter((ligne) => ligne.produit.monnaie === "propre")
    .reduce((total, ligne) => total + ligne.produit.prix * ligne.quantite, 0);

  const totalSale = lignes
    .filter((ligne) => ligne.produit.monnaie === "sale")
    .reduce((total, ligne) => total + ligne.produit.prix * ligne.quantite, 0);

  const totalGeneral = totalPropre + totalSale;

  async function enregistrerTransaction() {
    if (!groupe || lignes.length === 0) {
      alert("Ajoute au moins un produit.");
      return;
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        groupe_id: groupe.id,
        total_propre: totalPropre,
        total_sale: totalSale,
        total_general: totalGeneral,
        note,
      })
      .select()
      .single();

    if (error) {
      alert("Erreur transaction : " + error.message);
      return;
    }

    const lignesInsert = lignes.map((ligne) => ({
      transaction_id: transaction.id,
      produit_id: ligne.produit.id,
      produit_nom: ligne.produit.nom,
      quantite: ligne.quantite,
      prix_unitaire: ligne.produit.prix,
      total: ligne.produit.prix * ligne.quantite,
      monnaie: ligne.produit.monnaie,
    }));

    const { error: lignesError } = await supabase
      .from("transaction_lignes")
      .insert(lignesInsert);

    if (lignesError) {
      alert("Erreur lignes : " + lignesError.message);
      return;
    }

    await supabase.from("historique").insert({
  type: "Transaction",
  utilisateur: "Nico",
  description:
    `Groupe : ${groupe.nom}\n\n` +
    lignes
      .map(
        (ligne) =>
          `${ligne.produit.nom} x${ligne.quantite} = ${(
            ligne.produit.prix * ligne.quantite
          ).toLocaleString()} $`
      )
      .join("\n") +
    `\n\nArgent propre : ${totalPropre.toLocaleString()} $` +
    `\nArgent sale : ${totalSale.toLocaleString()} $` +
    `\nTotal : ${totalGeneral.toLocaleString()} $` +
    (note ? `\n\nNote : ${note}` : ""),
});

alert("Transaction enregistrée !");
setLignes([]);
setNote("");
}

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">💰 Transactions</h1>

      <div className="bg-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block mb-2">Groupe</label>
          <select
            className="w-full bg-slate-700 p-3 rounded"
            value={groupeId}
            onChange={(e) => {
              setGroupeId(Number(e.target.value));
              setProduitId(0);
            }}
          >
            {groupes.map((groupe) => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Produit</label>
          <select
            className="w-full bg-slate-700 p-3 rounded"
            value={produitId}
            onChange={(e) => setProduitId(Number(e.target.value))}
          >
            <option value={0}>Sélectionner un produit</option>
            {produits.map((produit) => (
              <option key={produit.id} value={produit.id}>
                {produit.nom} - {produit.prix.toLocaleString()} $
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Quantité</label>
          <input
            type="number"
            min="1"
            className="w-full bg-slate-700 p-3 rounded"
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
          />
        </div>

        <button
          onClick={ajouterLigne}
          className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500"
        >
          Ajouter à la transaction
        </button>
      </div>

      <div className="mt-6 bg-slate-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Panier</h2>

        {lignes.length === 0 ? (
          <p className="text-slate-400">Aucun produit ajouté.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-700">
                <th className="pb-2">Produit</th>
                <th className="pb-2">Quantité</th>
                <th className="pb-2">Prix</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Argent</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {lignes.map((ligne, index) => (
                <tr key={index} className="border-b border-slate-700">
                  <td className="py-3">{ligne.produit.nom}</td>
                  <td className="py-3">{ligne.quantite}</td>
                  <td className="py-3">{ligne.produit.prix.toLocaleString()} $</td>
                  <td className="py-3">
                    {(ligne.produit.prix * ligne.quantite).toLocaleString()} $
                  </td>
                  <td className="py-3">
                    {ligne.produit.monnaie === "sale"
                      ? "💵 Sale"
                      : "🏦 Propre"}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => supprimerLigne(index)}
                      className="text-red-400"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-700 rounded p-4">
            <p className="text-slate-300">Argent propre</p>
            <p className="text-2xl font-bold">{totalPropre.toLocaleString()} $</p>
          </div>

          <div className="bg-slate-700 rounded p-4">
            <p className="text-slate-300">Argent sale</p>
            <p className="text-2xl font-bold">{totalSale.toLocaleString()} $</p>
          </div>

          <div className="bg-slate-700 rounded p-4">
            <p className="text-slate-300">Total général</p>
            <p className="text-2xl font-bold">{totalGeneral.toLocaleString()} $</p>
          </div>
        </div>

        <textarea
          className="mt-6 w-full bg-slate-700 p-3 rounded"
          placeholder="Note optionnelle..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          onClick={enregistrerTransaction}
          className="mt-4 rounded bg-green-600 px-5 py-3 hover:bg-green-500"
        >
          Enregistrer la transaction
        </button>
      </div>
    </main>
  );
}