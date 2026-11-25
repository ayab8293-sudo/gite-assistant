
"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Settings,
  Mail,
  LockKeyhole,
  Info,
} from "lucide-react";
import AppLayout from "../../components/AppLayout";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setError("Impossible de récupérer les informations du compte.");
      } else {
        setEmail(data.user?.email ?? "");
      }

      setLoading(false);
    };

    loadAccount();
  }, []);

  const handlePasswordReset = async () => {
    if (!email) return;

    setSending(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } else {
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    }

    setSending(false);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:px-12 lg:pb-10 xl:px-16">

        <section className="mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101e33]">
            Paramètres
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#697586]">
            Gérez les informations de votre compte et les paramètres de votre application.
          </p>
        </section>

        <div className="space-y-6">

          {/* Mon compte */}
          <section className="overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#edf0f4] px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f4f9] text-[#29466b]">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#172d4d]">
                  Mon compte
                </h3>
                <p className="mt-1 text-xs text-[#8993a2]">
                  Informations du compte connecté.
                </p>
              </div>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-[#39465a]">
                Adresse e-mail
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[#e2e7ef] bg-[#fafbfc] px-4 py-3">
                <Mail size={18} className="shrink-0 text-[#8993a2]" />
                <span className="text-sm text-[#39465a]">
                  {loading ? "Chargement..." : email || "Adresse indisponible"}
                </span>
              </div>

              <p className="mt-3 text-xs text-[#8993a2]">
                L'adresse associée à votre compte Supabase.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section className="overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#edf0f4] px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f4f9] text-[#29466b]">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#172d4d]">
                  Sécurité
                </h3>
                <p className="mt-1 text-xs text-[#8993a2]">
                  Gérez la sécurité de votre accès.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <LockKeyhole size={19} className="mt-0.5 shrink-0 text-[#8993a2]" />
                <div>
                  <p className="text-sm font-medium text-[#39465a]">
                    Mot de passe
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[#8993a2]">
                    Recevez un lien sécurisé pour choisir un nouveau mot de passe.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePasswordReset}
                disabled={sending || loading || !email}
                className="rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-sm font-medium text-[#29466b] transition hover:border-[#5279a8] hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Envoi en cours..." : "Réinitialiser"}
              </button>
            </div>

            {message && (
              <p className="mx-6 mb-6 rounded-xl bg-[#edf7f1] px-4 py-3 text-sm text-[#27845d]">
                {message}
              </p>
            )}

            {error && (
              <p className="mx-6 mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </section>

          {/* Application */}
          <section className="overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#edf0f4] px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f4f9] text-[#29466b]">
                <Settings size={20} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#172d4d]">
                  Application
                </h3>
                <p className="mt-1 text-xs text-[#8993a2]">
                  Informations générales.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-start gap-3">
                <Info size={19} className="mt-0.5 shrink-0 text-[#8993a2]" />
                <div>
                  <p className="text-sm font-medium text-[#39465a]">
                    Gîte Assistant
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[#8993a2]">
                    Plateforme de gestion intelligente dédiée aux professionnels de l'hébergement.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#edf0f4] pt-4">
                <p className="text-xs text-[#8993a2]">
                  Version prototype · Développement en cours
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
