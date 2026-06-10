"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  logo_url: string | null;
  actif?: boolean;
  produits: Produit[];
};

const groupeVide = {
  nom: "",
  activite: "",
  logo_url: "",
};

function afficherMonnaie(monnaie: "propre" | "sale") {
  return monnaie === "sale" ? "💵 Sale" : "🏦 Propre";
}

function nettoyerGroupes(groupes: Groupe[]) {
  return groupes
    .filter((groupe) => groupe.actif !== false)
    .map((groupe) => ({
      ...groupe,
      produits: groupe.produits.filter((produit) => produit.actif !== false),
    }));
}

export default function GroupesClient({ groupes }: { groupes: Groupe[] }) {
  const router = useRouter();

  const [liste, setListe] = useState(nettoyerGroupes(groupes));
  const [modal, setModal] = useState(false);
  const [edition, setEdition] = useState<Groupe | null>(null);
  const [form, setForm] = useState(groupeVide);

  const [produitForm, setProduitForm] = useState({
    nom: "",
    type: "vente" as "vente" | "rachat",
    prix: 0,
    monnaie: "propre" as "propre" | "sale",
  });

  useEffect(() => {
    setListe(nettoyerGroupes(groupes));
  }, [groupes]);

  function ouvrirAjout() {
    setEdition(null);
    setForm(groupeVide);
    setProduitForm({
      nom: "",
      type: "vente",
      prix: 0,
      monnaie: "propre",
    });
    setModal(true);
  }

  function ouvrirEdition(groupe: Groupe) {
    const groupeNettoye = {
      ...groupe,
      produits: groupe.produits.filter((produit) => produit.actif !== false),
    };

    setEdition(groupeNettoye);
    setForm({
      nom: groupe.nom,
      activite: groupe.activite,
      logo_url: groupe.logo_url || "",
    });
    setProduitForm({
      nom: "",
      type: "vente",
      prix: 0,
      monnaie: "propre",
    });
    setModal(true);
  }

  async function sauvegarderGroupe() {
    if (!form.nom.trim() || !form.activite.trim()) {
      toast.error("Nom et type obligatoires");
      return;
    }

    if (edition) {
      const { error } = await supabase
        .from("groupes")
        .update({
          nom: form.nom,
          activite: form.activite,
          logo_url: form.logo_url || null,
        })
        .eq("id", edition.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      const updated = {
        ...edition,
        nom: form.nom,
        activite: form.activite,
        logo_url: form.logo_url || null,
      };

      setEdition(updated);
      setListe((ancienne) =>
        ancienne.map((groupe) => (groupe.id === edition.id ? updated : groupe))
      );

      toast.success("Groupe sauvegardé");
      router.refresh();
    } else {
      const { data, error } = await supabase
        .from("groupes")
        .insert({
          nom: form.nom,
          activite: form.activite,
          logo_url: form.logo_url || null,
          actif: true,
        })
        .select("*, produits(*)")
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      const nouveauGroupe = {
        ...data,
        produits: data.produits || [],
      };

      setListe((ancienne) => [...ancienne, nouveauGroupe]);
      setEdition(nouveauGroupe);

      toast.success("Groupe créé");
      router.refresh();
    }
  }

  async function desactiverGroupe(id: number) {
    if (!confirm("Désactiver ce groupe ?")) return;

    const { error } = await supabase
      .from("groupes")
      .update({ actif: false })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setListe((ancienne) => ancienne.filter((groupe) => groupe.id !== id));
    toast.success("Groupe désactivé");
    router.refresh();
  }

  async function ajouterProduit() {
    if (!edition) {
      toast.error("Sauvegarde d'abord le groupe");
      return;
    }

    if (!produitForm.nom.trim()) {
      toast.error("Nom du produit obligatoire");
      return;
    }

    const { data, error } = await supabase
      .from("produits")
      .insert({
        groupe_id: edition.id,
        nom: produitForm.nom,
        type: produitForm.type,
        prix: produitForm.prix,
        monnaie: produitForm.monnaie,
        actif: true,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const updated = {
      ...edition,
      produits: [...edition.produits, data],
    };

    setEdition(updated);
    setListe((ancienne) =>
      ancienne.map((groupe) => (groupe.id === edition.id ? updated : groupe))
    );

    setProduitForm({
      nom: "",
      type: "vente",
      prix: 0,
      monnaie: "propre",
    });

    toast.success("Produit ajouté");
    router.refresh();
  }

  async function desactiverProduit(id: number) {
    if (!edition) return;

    const { error } = await supabase
      .from("produits")
      .update({ actif: false })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const updated = {
      ...edition,
      produits: edition.produits.filter((produit) => produit.id !== id),
    };

    setEdition(updated);
    setListe((ancienne) =>
      ancienne.map((groupe) => (groupe.id === edition.id ? updated : groupe))
    );

    toast.success("Produit supprimé");
    router.refresh();
  }

  async function uploadLogo(file: File) {
    if (!edition) {
      toast.error("Sauvegarde d'abord le groupe avant d'ajouter un logo.");
      return;
    }

    const extension = file.name.split(".").pop();
    const fileName = `groupe-${edition.id}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("logos")
      .upload(fileName, file);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    const logoUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("groupes")
      .update({ logo_url: logoUrl })
      .eq("id", edition.id);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    const updated = {
      ...edition,
      logo_url: logoUrl,
    };

    setEdition(updated);
    setForm({
      ...form,
      logo_url: logoUrl,
    });
    setListe((ancienne) =>
      ancienne.map((groupe) => (groupe.id === edition.id ? updated : groupe))
    );

    toast.success("Logo importé");
    router.refresh();
  }

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">🤝 Groupes</h1>
          <p className="mt-2 text-slate-400">
            Gestion des groupes, ventes et rachats
          </p>
        </div>

        <button
          onClick={ouvrirAjout}
          className="rounded bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
        >
          ➕ Ajouter un groupe
        </button>
      </div>

      <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
        {liste.map((groupe) => {
          const ventes = groupe.produits.filter((p) => p.type === "vente");
          const rachats = groupe.produits.filter((p) => p.type === "rachat");

          return (
            <div
              key={groupe.id}
              className="rounded-xl bg-slate-800 p-6 border border-slate-700"
            >
              <div className="mb-4">
                {groupe.logo_url ? (
                  <img
                    src={groupe.logo_url}
                    alt={groupe.nom}
                    className="mb-4 h-24 w-24 rounded-xl object-cover bg-slate-900"
                  />
                ) : (
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-xl bg-slate-900 text-slate-500">
                    Logo
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-1">{groupe.nom}</h2>
                <p className="text-slate-400 mb-4">🎯 {groupe.activite}</p>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 font-bold text-green-400">📤 Vente</h3>

                {ventes.length === 0 ? (
                  <p className="text-slate-500">Aucun produit</p>
                ) : (
                  <div className="space-y-2">
                    {ventes.map((produit) => (
                      <div
                        key={produit.id}
                        className="rounded bg-slate-900 p-3 text-slate-300"
                      >
                        {produit.nom} - {produit.prix.toLocaleString()} ${" "}
                        {afficherMonnaie(produit.monnaie)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="mb-2 font-bold text-blue-400">📥 Rachat</h3>

                {rachats.length === 0 ? (
                  <p className="text-slate-500">Aucun produit</p>
                ) : (
                  <div className="space-y-2">
                    {rachats.map((produit) => (
                      <div
                        key={produit.id}
                        className="rounded bg-slate-900 p-3 text-slate-300"
                      >
                        {produit.nom} - {produit.prix.toLocaleString()} ${" "}
                        {afficherMonnaie(produit.monnaie)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => ouvrirEdition(groupe)}
                  className="flex-1 rounded bg-blue-600 px-4 py-2 hover:bg-blue-500"
                >
                  ✏️ Modifier
                </button>

                <button
                  onClick={() => desactiverGroupe(groupe.id)}
                  className="rounded bg-red-600 px-4 py-2 hover:bg-red-500"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-slate-900 p-6 border border-slate-700">
            <h2 className="mb-6 text-2xl font-bold">
              {edition ? "✏️ Modifier groupe" : "➕ Ajouter groupe"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                className="rounded bg-slate-800 p-3"
                placeholder="Nom du groupe"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />

              <input
                className="rounded bg-slate-800 p-3"
                placeholder="Type / activité"
                value={form.activite}
                onChange={(e) =>
                  setForm({ ...form, activite: e.target.value })
                }
              />

              <div className="md:col-span-2 rounded bg-slate-800 p-4">
                <label className="block mb-2 text-slate-300">
                  Logo du groupe
                </label>

                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Logo"
                    className="mb-4 h-24 w-24 rounded-xl object-cover bg-slate-900"
                  />
                ) : (
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-xl bg-slate-900 text-slate-500">
                    Logo
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadLogo(file);
                  }}
                  className="w-full rounded bg-slate-700 p-3"
                />
              </div>
            </div>

            <button
              onClick={sauvegarderGroupe}
              className="mb-6 rounded bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
            >
              Sauvegarder le groupe
            </button>

            {edition && (
              <>
                <h3 className="mb-4 text-xl font-bold">Produits</h3>

                <div className="grid md:grid-cols-5 gap-3 mb-4">
                  <input
                    className="rounded bg-slate-800 p-3"
                    placeholder="Produit"
                    value={produitForm.nom}
                    onChange={(e) =>
                      setProduitForm({
                        ...produitForm,
                        nom: e.target.value,
                      })
                    }
                  />

                  <select
                    className="rounded bg-slate-800 p-3"
                    value={produitForm.type}
                    onChange={(e) =>
                      setProduitForm({
                        ...produitForm,
                        type: e.target.value as "vente" | "rachat",
                      })
                    }
                  >
                    <option value="vente">📤 Vente</option>
                    <option value="rachat">📥 Rachat</option>
                  </select>

                  <input
                    type="number"
                    className="rounded bg-slate-800 p-3"
                    placeholder="Prix"
                    value={produitForm.prix}
                    onChange={(e) =>
                      setProduitForm({
                        ...produitForm,
                        prix: Number(e.target.value),
                      })
                    }
                  />

                  <select
                    className="rounded bg-slate-800 p-3"
                    value={produitForm.monnaie}
                    onChange={(e) =>
                      setProduitForm({
                        ...produitForm,
                        monnaie: e.target.value as "propre" | "sale",
                      })
                    }
                  >
                    <option value="propre">🏦 Propre</option>
                    <option value="sale">💵 Sale</option>
                  </select>

                  <button
                    onClick={ajouterProduit}
                    className="rounded bg-blue-600 p-3 hover:bg-blue-500"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="space-y-2">
                  {edition.produits.length === 0 ? (
                    <p className="text-slate-500">
                      Aucun produit pour ce groupe.
                    </p>
                  ) : (
                    edition.produits.map((produit) => (
                      <div
                        key={produit.id}
                        className="flex items-center justify-between rounded bg-slate-800 p-3"
                      >
                        <span>
                          {produit.type === "vente" ? "📤 Vente" : "📥 Rachat"}{" "}
                          - {produit.nom} - {produit.prix.toLocaleString()} ${" "}
                          {afficherMonnaie(produit.monnaie)}
                        </span>

                        <button
                          onClick={() => desactiverProduit(produit.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModal(false)}
                className="rounded bg-slate-700 px-5 py-3 hover:bg-slate-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}