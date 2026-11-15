"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
export default function Home() {
    const [connectionStatus, setConnectionStatus] = useState("Vérification...");

  useEffect(() => {
    supabase.auth.getSession().then(({ error }) => {
      setConnectionStatus(
        error ? "Connexion impossible" : "Client Supabase initialisé"
      );
    });
  }, []);
  return (
    <main className="min-h-screen bg-[#f5f6f4] text-[#202c29]">
      <p className="px-6 py-2 text-sm">
  Connexion Supabase : {connectionStatus}
</p>
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gîte<span className="text-emerald-700">Assistant</span>
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Votre gestion, intelligemment simplifiée.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
          Espace gestionnaire
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-9">
          <p className="text-sm font-medium text-emerald-700">
            VOTRE ESPACE DE GESTION
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            Bonjour 👋
          </h2>
          <p className="mt-2 text-gray-500">
            Voici un aperçu de votre activité.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Établissements", value: "02", icon: "⌂" },
            { label: "Réservations", value: "12", icon: "▤" },
            { label: "Tâches en cours", value: "05", icon: "✓" },
            { label: "Arrivées à venir", value: "03", icon: "↗" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <span className="text-xl text-emerald-700">
                  {item.icon}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Activité du jour</h3>
              <span className="text-xs text-gray-400">APERÇU</span>
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  time: "09:00",
                  title: "Préparation du logement",
                  detail: "Maison des Oliviers",
                  status: "À effectuer",
                },
                {
                  time: "11:30",
                  title: "Contrôle du ménage",
                  detail: "Le Jardin Secret",
                  status: "En cours",
                },
                {
                  time: "15:00",
                  title: "Arrivée des voyageurs",
                  detail: "Maison des Oliviers",
                  status: "À venir",
                },
              ].map((task) => (
                <div
                  key={task.title}
                  className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center"
                >
                  <span className="text-sm font-semibold text-emerald-700">
                    {task.time}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{task.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {task.detail}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#183b32] p-6 text-white shadow-sm">
            <div className="text-3xl">✦</div>
            <p className="mt-5 text-xs font-semibold tracking-widest text-emerald-200">
              INTELLIGENCE ARTIFICIELLE
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              Votre assistant intelligent.
            </h3>
            <p className="mt-3 text-sm leading-6 text-emerald-100">
              Gîte Assistant vous aidera à organiser vos opérations,
              anticiper les imprévus et simplifier votre quotidien.
            </p>
            <div className="mt-7 rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm font-medium">
                Votre assistant se prépare...
              </p>
              <p className="mt-1 text-xs text-emerald-100">
                Les fonctionnalités IA seront connectées progressivement.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
          Gîte Assistant · Votre gestion, intelligemment simplifiée.
          <br />
          Prototype de démonstration
        </footer>
      </div>
    </main>
  );
}
