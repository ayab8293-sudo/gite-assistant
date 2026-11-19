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
    <section className="rounded-2xl border border-[#e2e7ef] bg-white p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Créer votre organisation</h2>
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
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
        />

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-xl bg-[#172d4d] px-6 py-3 font-medium text-white shadow-sm transition duration-200 hover:bg-[#29466b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
