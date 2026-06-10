"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

type Membre = {
  id: number;
  nom: string;
  grade: string;
  present: boolean;
  telephone: string | null;
  compte: string | null;
  banque: number;
  appartement: string | null;
  email: string | null;
};

type Appartement = {
  code: string;
  code_acces: string | null;
};

const membreVide = {
  nom: "",
  grade: "Membre",
  present: false,
  telephone: "",
  compte: "",
  banque: 0,
  appartement: "",
  email: "",
};

const grades = {
  Boss: 4,
  "Bras droit": 3,
  Membre: 2,
  Recrue: 1,
};

export default function EffectifsClient({
  membres,
  appartements,
}: {
  membres: Membre[];
  appartements: Appartement[];
}) {
  const router = useRouter();

  const [liste, setListe] = useState(membres);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [edition, setEdition] = useState<Membre | null>(null);
  const [form, setForm] = useState(membreVide);
  const [gradeConnecte, setGradeConnecte] = useState("");
  const [ordreGrade, setOrdreGrade] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setListe(membres);
  }, [membres]);

  const peutVoirEmail =
    gradeConnecte === "Boss" || gradeConnecte === "Bras droit";

  const listeTriee = [...liste].sort((a, b) => {
    const gradeA = grades[a.grade as keyof typeof grades] || 0;
    const gradeB = grades[b.grade as keyof typeof grades] || 0;

    return ordreGrade === "desc" ? gradeB - gradeA : gradeA - gradeB;
  });

  useEffect(() => {
    async function chargerMembreConnecte() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return;

      const { data } = await supabase
        .from("membres")
        .select("grade")
        .eq("email", user.email)
        .single();

      if (data) {
        setGradeConnecte(data.grade);
      }
    }

    chargerMembreConnecte();
  }, []);

  const presents = liste.filter((m) => m.present).length;
  const absents = liste.length - presents;

  function getCodeAcces(appartementCode: string | null) {
    if (!appartementCode) return "-";

    const appartement = appartements.find((a) => a.code === appartementCode);

    return appartement?.code_acces || "-";
  }

  function ouvrirAjout() {
    setEdition(null);
    setForm(membreVide);
    setModalOuverte(true);
  }

  function ouvrirEdition(membre: Membre) {
    setEdition(membre);
    setForm({
      nom: membre.nom,
      grade: membre.grade,
      present: membre.present,
      telephone: membre.telephone || "",
      compte: membre.compte || "",
      banque: membre.banque || 0,
      appartement: membre.appartement || "",
      email: membre.email || "",
    });
    setModalOuverte(true);
  }

  async function sauvegarder() {
    if (!form.nom.trim()) {
      toast.error("Nom obligatoire");
      return;
    }

    if (edition) {
      const { error } = await supabase
        .from("membres")
        .update(form)
        .eq("id", edition.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      setListe((ancienne) =>
        ancienne.map((m) => (m.id === edition.id ? { ...m, ...form } : m))
      );

      toast.success("Membre modifié");
      router.refresh();
    } else {
      const { data, error } = await supabase
        .from("membres")
        .insert(form)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      setListe((ancienne) => [...ancienne, data]);
      toast.success("Membre ajouté");
      router.refresh();
    }

    setModalOuverte(false);
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce membre ?")) return;

    const { error } = await supabase.from("membres").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setListe((ancienne) => ancienne.filter((m) => m.id !== id));
    toast.success("Membre supprimé");
    router.refresh();
  }

  async function reinitialiserPresences() {
    if (!confirm("Réinitialiser les présences de tous les membres ?")) return;

    const { error } = await supabase
      .from("membres")
      .update({ present: false })
      .neq("id", 0);

    if (error) {
      toast.error(error.message);
      return;
    }

    setListe((ancienne) =>
      ancienne.map((m) => ({
        ...m,
        present: false,
      }))
    );

    toast.success("Toutes les présences ont été réinitialisées");
    router.refresh();
  }

  return (
    <main className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">👥 Effectifs</h1>
          <p className="mt-2 text-slate-400">
            Gestion des membres de l'organisation
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={ouvrirAjout}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
          >
            ➕ Ajouter un membre
          </button>

          <button
            onClick={reinitialiserPresences}
            className="rounded-lg bg-orange-600 px-5 py-3 font-semibold hover:bg-orange-500"
          >
            🔄 Réinitialiser les présences
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl bg-slate-800 p-6">
          <p className="text-slate-400">Effectifs</p>
          <p className="text-3xl font-bold">{liste.length} / 20</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6">
          <p className="text-slate-400">Présents</p>
          <p className="text-3xl font-bold">{presents}</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-6">
          <p className="text-slate-400">Absents</p>
          <p className="text-3xl font-bold">{absents}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-slate-800">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-4 text-left">Nom</th>

              <th
                className="p-4 text-left cursor-pointer select-none hover:text-blue-400"
                onClick={() =>
                  setOrdreGrade(ordreGrade === "desc" ? "asc" : "desc")
                }
              >
                Grade {ordreGrade === "desc" ? "⬇️" : "⬆️"}
              </th>

              {peutVoirEmail && <th className="p-4 text-left">Email</th>}

              <th className="p-4 text-left">Présence</th>
              <th className="p-4 text-left">Téléphone</th>
              <th className="p-4 text-left">Compte</th>
              <th className="p-4 text-left">Appartement</th>
              <th className="p-4 text-left">Code accès</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {listeTriee.map((membre) => (
              <tr key={membre.id} className="border-t border-slate-700">
                <td className="p-4 font-semibold">{membre.nom}</td>
                <td className="p-4">{membre.grade}</td>

                {peutVoirEmail && (
                  <td className="p-4">{membre.email || "-"}</td>
                )}

                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={membre.present}
                    onChange={async (e) => {
                      const nouvelleValeur = e.target.checked;

                      setListe((ancienne) =>
                        ancienne.map((m) =>
                          m.id === membre.id
                            ? { ...m, present: nouvelleValeur }
                            : m
                        )
                      );

                      const { error } = await supabase
                        .from("membres")
                        .update({
                          present: nouvelleValeur,
                        })
                        .eq("id", membre.id);

                      if (error) {
                        toast.error(error.message);
                        return;
                      }

                      toast.success(
                        nouvelleValeur
                          ? "Membre marqué présent"
                          : "Membre marqué absent"
                      );

                      router.refresh();
                    }}
                    className="h-5 w-5 cursor-pointer"
                  />
                </td>

                <td className="p-4">{membre.telephone || "-"}</td>
                <td className="p-4">{membre.compte || "-"}</td>
                <td className="p-4">{membre.appartement || "-"}</td>
                <td className="p-4">{getCodeAcces(membre.appartement)}</td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => ouvrirEdition(membre)}
                      className="rounded bg-blue-600 px-3 py-2 hover:bg-blue-500"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => supprimer(membre.id)}
                      className="rounded bg-red-600 px-3 py-2 hover:bg-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl rounded-xl bg-slate-900 p-6 shadow-xl border border-slate-700">
            <h2 className="mb-6 text-2xl font-bold">
              {edition ? "✏️ Modifier un membre" : "➕ Ajouter un membre"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="rounded bg-slate-800 p-3"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />

              {peutVoirEmail && (
                <input
                  className="rounded bg-slate-800 p-3"
                  placeholder="Email de connexion"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              )}

              <select
                className="rounded bg-slate-800 p-3"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                <option>Boss</option>
                <option>Bras droit</option>
                <option>Membre</option>
                <option>Recrue</option>
              </select>

              <input
                className="rounded bg-slate-800 p-3"
                placeholder="Téléphone"
                value={form.telephone}
                onChange={(e) =>
                  setForm({ ...form, telephone: e.target.value })
                }
              />

              <input
                className="rounded bg-slate-800 p-3"
                placeholder="Compte bancaire"
                value={form.compte}
                onChange={(e) => setForm({ ...form, compte: e.target.value })}
              />

              <select
                className="rounded bg-slate-800 p-3"
                value={form.appartement}
                onChange={(e) =>
                  setForm({ ...form, appartement: e.target.value })
                }
              >
                <option value="">Aucun appartement</option>
                {appartements.map((appartement) => (
                  <option key={appartement.code} value={appartement.code}>
                    {appartement.code} - Code {appartement.code_acces || "-"}
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="rounded bg-slate-800 p-3"
                placeholder="Solde bancaire"
                value={form.banque}
                onChange={(e) =>
                  setForm({ ...form, banque: Number(e.target.value) })
                }
              />
            </div>

            <label className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.present}
                onChange={(e) =>
                  setForm({ ...form, present: e.target.checked })
                }
              />
              Présent
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOuverte(false)}
                className="rounded bg-slate-700 px-5 py-3 hover:bg-slate-600"
              >
                Annuler
              </button>

              <button
                onClick={sauvegarder}
                className="rounded bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
              >
                {edition ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}