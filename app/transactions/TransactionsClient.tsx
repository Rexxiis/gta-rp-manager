"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

type Produit = {
  id: number;
  groupe_id: number;
  nom: string;
  type: "vente" | "rachat";
  prix: number;
  monnaie: "propre" | "sale";
  actif?: boolean;
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

type Mode = "groupe" | "libre";

async function getNomUtilisateur() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "Inconnu";

  const { data: profil } = await supabase
    .from("profils")
    .select("membre_id")
    .eq("id", user.id)
    .single();

  if (!profil?.membre_id) return "Inconnu";

  const { data: membre } = await supabase
    .from("membres")
    .select("nom")
    .eq("id", profil.membre_id)
    .single();

  return membre?.nom || "Inconnu";
}

export default function TransactionsClient({ groupes }: { groupes: Groupe[] }) {
  const [mode, setMode] = useState<Mode>("groupe");

  const [groupeId, setGroupeId] = useState(groupes[0]?.id || 0);
  const [produitId, setProduitId] = useState<number>(0);
  const [quantite, setQuantite] = useState(1);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [note, setNote] = useState("");

  const [typeLibre, setTypeLibre] = useState("Véhicule");
  const [descriptionLibre, setDescriptionLibre] = useState("");
  const [montantLibre, setMontantLibre] = useState(0);
  const [monnaieLibre, setMonnaieLibre] = useState<"propre" | "sale">("propre");
  const [noteLibre, setNoteLibre] = useState("");

  const groupe = groupes.find((g) => g.id === Number(groupeId));
  const produits = groupe?.produits.filter((p) => p.actif !== false) || [];
  const produit = produits.find((p) => p.id === Number(produitId));

  const ventes = produits.filter((p) => p.type === "vente");
  const rachats = produits.filter((p) => p.type === "rachat");

  function ajouterLigne(produitChoisi?: Produit) {
    const produitFinal = produitChoisi || produit;

    if (!produitFinal) {
      toast.error("Sélectionne un produit.");
      return;
    }

    if (quantite <= 0) {
      toast.error("Entre une quantité valide.");
      return;
    }

    setLignes((ancienne) => [
      ...ancienne,
      {
        produit: produitFinal,
        quantite,
      },
    ]);

    toast.success(`${produitFinal.nom} ajouté au panier`);

    setProduitId(0);
    setQuantite(1);
  }

  function supprimerLigne(index: number) {
    setLignes((ancienne) => ancienne.filter((_, i) => i !== index));
    toast.success("Produit retiré du panier");
  }

  const totalPropre = lignes
    .filter((ligne) => ligne.produit.monnaie === "propre")
    .reduce((total, ligne) => total + ligne.produit.prix * ligne.quantite, 0);

  const totalSale = lignes
    .filter((ligne) => ligne.produit.monnaie === "sale")
    .reduce((total, ligne) => total + ligne.produit.prix * ligne.quantite, 0);

  const totalGeneral = totalPropre + totalSale;

  async function enregistrerTransactionGroupe() {
    if (!groupe || lignes.length === 0) {
      toast.error("Ajoute au moins un produit.");
      return;
    }

    const utilisateur = await getNomUtilisateur();

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
      toast.error("Erreur transaction : " + error.message);
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
      toast.error("Erreur lignes : " + lignesError.message);
      return;
    }

    const { error: historiqueError } = await supabase.from("historique").insert({
      type: "Transaction",
      utilisateur,
      description:
        `Transaction groupe\nGroupe : ${groupe.nom}\n\n` +
        lignes
          .map(
            (ligne) =>
              `${ligne.produit.type === "vente" ? "📤 Vente" : "📥 Rachat"} - ${
                ligne.produit.nom
              } x${ligne.quantite} = ${(
                ligne.produit.prix * ligne.quantite
              ).toLocaleString()} $`
          )
          .join("\n") +
        `\n\nArgent propre : ${totalPropre.toLocaleString()} $` +
        `\nArgent sale : ${totalSale.toLocaleString()} $` +
        `\nTotal : ${totalGeneral.toLocaleString()} $` +
        (note ? `\n\nNote : ${note}` : ""),
    });

    if (historiqueError) {
      toast.error("Transaction enregistrée, mais erreur historique.");
      return;
    }

    toast.success("Transaction groupe enregistrée !");
    setLignes([]);
    setNote("");
  }

  async function enregistrerTransactionLibre() {
    if (!descriptionLibre.trim() || montantLibre <= 0) {
      toast.error("Description et montant obligatoires.");
      return;
    }

    const utilisateur = await getNomUtilisateur();

    const { error } = await supabase.from("transactions_libres").insert({
      type: typeLibre,
      description: descriptionLibre,
      montant: montantLibre,
      monnaie: monnaieLibre,
      note: noteLibre,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const { error: historiqueError } = await supabase.from("historique").insert({
      type: "Transaction libre",
      utilisateur,
      description:
        `${typeLibre}\n${descriptionLibre}\n\n` +
        `Montant : ${montantLibre.toLocaleString()} $ ` +
        `${monnaieLibre === "sale" ? "💵 Sale" : "🏦 Propre"}` +
        (noteLibre ? `\n\nNote : ${noteLibre}` : ""),
    });

    if (historiqueError) {
      toast.error("Transaction enregistrée, mais erreur historique.");
      return;
    }

    toast.success("Transaction libre enregistrée !");
    setDescriptionLibre("");
    setMontantLibre(0);
    setMonnaieLibre("propre");
    setNoteLibre("");
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">💰 Transactions</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setMode("groupe")}
          className={`rounded-xl p-6 text-left border ${
            mode === "groupe"
              ? "bg-blue-600 border-blue-400"
              : "bg-slate-800 border-slate-700 hover:bg-slate-700"
          }`}
        >
          <h2 className="text-2xl font-bold">🤝 Transaction groupe</h2>
          <p className="mt-2 text-slate-200">Vente ou rachat avec un groupe</p>
        </button>

        <button
          onClick={() => setMode("libre")}
          className={`rounded-xl p-6 text-left border ${
            mode === "libre"
              ? "bg-blue-600 border-blue-400"
              : "bg-slate-800 border-slate-700 hover:bg-slate-700"
          }`}
        >
          <h2 className="text-2xl font-bold">📦 Transaction libre</h2>
          <p className="mt-2 text-slate-200">
            Véhicule, appartement ou carte grise
          </p>
        </button>
      </div>

      {mode === "groupe" && (
        <>
          <div className="bg-slate-800 rounded-xl p-6 space-y-4 border border-slate-700">
            <div>
              <label className="block mb-2">Groupe</label>
              <select
                className="w-full bg-slate-700 p-3 rounded"
                value={groupeId}
                onChange={(e) => {
                  setGroupeId(Number(e.target.value));
                  setProduitId(0);
                  setLignes([]);
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
              <label className="block mb-2">Quantité</label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-700 p-3 rounded"
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 text-green-400">
                📤 Vente
              </h2>

              {ventes.length === 0 ? (
                <p className="text-slate-400">Aucun produit en vente.</p>
              ) : (
                <div className="grid gap-3">
                  {ventes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => ajouterLigne(p)}
                      className="rounded bg-slate-900 p-4 text-left hover:bg-slate-700"
                    >
                      <p className="font-semibold">{p.nom}</p>
                      <p className="text-slate-400">
                        {p.prix.toLocaleString()} $ —{" "}
                        {p.monnaie === "sale" ? "💵 Sale" : "🏦 Propre"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">
                📥 Rachat
              </h2>

              {rachats.length === 0 ? (
                <p className="text-slate-400">Aucun produit en rachat.</p>
              ) : (
                <div className="grid gap-3">
                  {rachats.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => ajouterLigne(p)}
                      className="rounded bg-slate-900 p-4 text-left hover:bg-slate-700"
                    >
                      <p className="font-semibold">{p.nom}</p>
                      <p className="text-slate-400">
                        {p.prix.toLocaleString()} $ —{" "}
                        {p.monnaie === "sale" ? "💵 Sale" : "🏦 Propre"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Panier</h2>

            {lignes.length === 0 ? (
              <p className="text-slate-400">Aucun produit ajouté.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="pb-2">Produit</th>
                    <th className="pb-2">Type</th>
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
                      <td className="py-3">
                        {ligne.produit.type === "vente"
                          ? "📤 Vente"
                          : "📥 Rachat"}
                      </td>
                      <td className="py-3">{ligne.quantite}</td>
                      <td className="py-3">
                        {ligne.produit.prix.toLocaleString()} $
                      </td>
                      <td className="py-3">
                        {(
                          ligne.produit.prix * ligne.quantite
                        ).toLocaleString()}{" "}
                        $
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
                <p className="text-2xl font-bold">
                  {totalPropre.toLocaleString()} $
                </p>
              </div>

              <div className="bg-slate-700 rounded p-4">
                <p className="text-slate-300">Argent sale</p>
                <p className="text-2xl font-bold">
                  {totalSale.toLocaleString()} $
                </p>
              </div>

              <div className="bg-slate-700 rounded p-4">
                <p className="text-slate-300">Total général</p>
                <p className="text-2xl font-bold">
                  {totalGeneral.toLocaleString()} $
                </p>
              </div>
            </div>

            <textarea
              className="mt-6 w-full bg-slate-700 p-3 rounded"
              placeholder="Note optionnelle..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              onClick={enregistrerTransactionGroupe}
              className="mt-4 rounded bg-green-600 px-5 py-3 hover:bg-green-500"
            >
              Enregistrer la transaction groupe
            </button>
          </div>
        </>
      )}

      {mode === "libre" && (
        <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">📦 Transaction libre</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              className="rounded bg-slate-700 p-3"
              value={typeLibre}
              onChange={(e) => setTypeLibre(e.target.value)}
            >
              <option value="Véhicule">🚗 Véhicule</option>
              <option value="Appartement">🏠 Appartement</option>
              <option value="Carte grise">📄 Carte grise</option>
            </select>

            <select
              className="rounded bg-slate-700 p-3"
              value={monnaieLibre}
              onChange={(e) =>
                setMonnaieLibre(e.target.value as "propre" | "sale")
              }
            >
              <option value="propre">🏦 Propre</option>
              <option value="sale">💵 Sale</option>
            </select>

            <input
              className="rounded bg-slate-700 p-3"
              placeholder="Description"
              value={descriptionLibre}
              onChange={(e) => setDescriptionLibre(e.target.value)}
            />

            <input
              type="number"
              className="rounded bg-slate-700 p-3"
              placeholder="Montant"
              value={montantLibre}
              onChange={(e) => setMontantLibre(Number(e.target.value))}
            />
          </div>

          <textarea
            className="mt-4 w-full rounded bg-slate-700 p-3"
            placeholder="Note optionnelle..."
            value={noteLibre}
            onChange={(e) => setNoteLibre(e.target.value)}
          />

          <button
            onClick={enregistrerTransactionLibre}
            className="mt-4 rounded bg-green-600 px-5 py-3 hover:bg-green-500"
          >
            Enregistrer la transaction libre
          </button>
        </div>
      )}
    </main>
  );
}