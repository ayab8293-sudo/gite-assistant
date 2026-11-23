"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Wallet,
  Sparkles,
  Settings,
} from "lucide-react";

const navigationItems = [
  { label: "Vue d'ensemble", href: "/", icon: LayoutDashboard },
  { label: "Établissements", href: "/etablissements", icon: Building2 },
  { label: "Logements", href: "/logements", icon: BedDouble },
  { label: "Réservations", href: "/reservations", icon: CalendarDays },
  { label: "Calendrier", href: "/calendrier", icon: CalendarRange },
  { label: "Finances", href: "/finances", icon: Wallet },
  { label: "Tâches", href: "/taches", icon: ClipboardList },
  { label: "Assistant IA", href: "/assistant", icon: Sparkles },
  { label: "Paramètres", href: "/parametres", icon: Settings },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#111d30] px-5 py-7 text-white lg:flex">
        <div className="mb-12 px-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Gîte<span className="text-blue-300">Assistant</span>
          </h1>
          <p className="mt-2 text-xs tracking-wide text-slate-400">
            MANAGEMENT PLATFORM
          </p>
        </div>

        <p className="mb-4 px-3 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
          ESPACE DE TRAVAIL
        </p>

        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white/10 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={1.7} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs font-medium text-white">Gîte Assistant</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Votre espace de gestion intelligent.
          </p>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 overflow-x-auto border-t border-[#e2e7ef] bg-white/95 px-2 py-3 shadow-[0_-8px_30px_rgba(23,45,77,0.08)] backdrop-blur-xl lg:hidden">
        <div className="flex min-w-max items-center justify-around gap-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[65px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[9px] transition-colors ${
                  active
                    ? "font-semibold text-[#29466b]"
                    : "text-slate-400"
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
