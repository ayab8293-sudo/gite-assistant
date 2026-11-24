"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import AppNavigation from "./AppNavigation";
import LoginForm from "../app/LoginForm";
import ResetPasswordForm from "../app/ResetPasswordForm";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);

      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }

      if (event === "USER_UPDATED" || event === "SIGNED_OUT") {
        setIsPasswordRecovery(false);
      }

      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return <p className="p-6">Chargement...</p>;
  }

  if (isPasswordRecovery) {
    return <ResetPasswordForm />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#171d29]">
      <AppNavigation />

      <div className="lg:ml-64">
        <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-[#e2e7ef]/80 bg-white/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#172d4d]">
              Gîte<span className="text-[#29466b]">Assistant</span>
            </h1>
            <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
              Votre gestion, intelligemment simplifiée.
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
            <div className="rounded-full border border-[#e2e7ef] bg-[#f5f7fa] px-4 py-2 text-xs font-semibold tracking-wide text-[#29466b]">
              Espace gestionnaire
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="whitespace-nowrap rounded-xl border border-[#d5dbe4] bg-white px-4 py-2 text-sm font-medium text-[#39465a] transition-all duration-200 hover:border-[#5279a8] hover:bg-[#f5f7fa] hover:text-[#172d4d]"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}