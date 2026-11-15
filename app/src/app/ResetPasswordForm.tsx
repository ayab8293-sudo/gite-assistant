"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (password !== confirmation) {
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Erreur Supabase : ${error.message}`);
    } else {
      setMessage("Mot de passe modifié avec succès !");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f4] px-6">
      <form
        onSubmit={handleUpdatePassword}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-[#202c29]">
          Gîte<span className="text-emerald-700">Assistant</span>
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Choisissez votre nouveau mot de passe.
        </p>

        <label className="mt-7 block text-sm font-medium">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="8 caractères minimum"
        />

        <label className="mt-5 block text-sm font-medium">
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="Répétez le mot de passe"
        />

        {message && (
          <p className="mt-4 text-sm text-gray-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-[#183b32] px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
        </button>
      </form>
    </main>
  );
}