"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function OrganizationForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const createOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("organizations")
      .insert({
        name: name.trim(),
        owner_user_id: user.id,
      });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Organisation créée avec succès !");
      setName("");
    }

    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Créer votre organisation</h2>
      <p className="mt-2 text-sm text-gray-500">
        Commencez par renseigner le nom de votre entreprise.
      </p>

      <form onSubmit={createOrganization} className="mt-5 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de votre organisation"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon organisation"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
