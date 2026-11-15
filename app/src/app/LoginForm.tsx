"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Erreur Supabase : ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f4] px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-[#202c29]">
          Gîte<span className="text-emerald-700">Assistant</span>
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Connectez-vous à votre espace de gestion.
        </p>

        <label className="mt-7 block text-sm font-medium">
          Adresse e-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-700"
          placeholder="votre@email.com"
        />

        <label className="mt-5 block text-sm font-medium">
          Mot de passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-700"
          placeholder="Votre mot de passe"
        />

        {message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-[#183b32] px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
