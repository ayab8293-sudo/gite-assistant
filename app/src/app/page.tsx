"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  CalendarRange,
  ClipboardList,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import LoginForm from "./LoginForm";
import ResetPasswordForm from "./ResetPasswordForm";
import OrganizationForm from "./OrganizationForm";
import PropertyForm from "./PropertyForm";
import PropertyList from "./PropertyList";
import UnitForm from "./UnitForm";
import UnitList from "./UnitList";
import ReservationForm from "./ReservationForm";
import ReservationList from "./ReservationList";
import ReservationCalendar from "./ReservationCalendar";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
type DashboardTask = {
  id: string;
  title: string;
  due_at: string;
  status: string;
  property_id: string;
  unit_id: string | null;
};

type DashboardProperty = {
  id: string;
  name: string;
};

type DashboardUnit = {
  id: string;
  name: string;
};
export default function Home() {
  const updateDashboardTaskStatus = async (
  taskId: string,
  newStatus: string
) => {
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    console.error("Erreur changement de statut :", error.message);
    return;
  }

  setTodayTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    )
  );
};
  const [connectionStatus, setConnectionStatus] = useState("Vérification...");
const [databaseStatus, setDatabaseStatus] = useState("Test en attente...");
const [activeSection, setActiveSection] = useState("dashboard");
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
const [authLoading, setAuthLoading] = useState(true);
const [propertyCount, setPropertyCount] = useState(0);
const [reservationCount, setReservationCount] = useState(0);
const [taskCount, setTaskCount] = useState(0);
const [unitCount, setUnitCount] = useState(0);
const [upcomingArrivals, setUpcomingArrivals] = useState(0);
const [todayTasks, setTodayTasks] = useState<DashboardTask[]>([]);
const [dashboardProperties, setDashboardProperties] = useState<DashboardProperty[]>([]);
const [dashboardUnits, setDashboardUnits] = useState<DashboardUnit[]>([]);
useEffect(() => {
  const handleScroll = () => {
    const sections = [
      "etablissements",
      "logements",
      "reservations",
      "calendrier",
      "taches",
    ];

    let currentSection = "dashboard";

    sections.forEach((id) => {
      const element = document.getElementById(id);

      if (element && element.getBoundingClientRect().top <= 180) {
        currentSection = id;
      }
    });

    setActiveSection(currentSection);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  return () => window.removeEventListener("scroll", handleScroll);
}, []);
useEffect(() => {
    if (authLoading || !isAuthenticated) return;
  const loadDashboardStats = async () => {
    const [properties, reservations, tasks, units, arrivals] =
      await Promise.all([
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("reservations")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "in_progress"]),

        supabase
          .from("units")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("reservations")
          .select("*", { count: "exact", head: true })
          .gte("check_in", new Date().toISOString().split("T")[0])
          .in("status", ["pending", "confirmed"]),
      ]);

    setPropertyCount(properties.count ?? 0);
    setReservationCount(reservations.count ?? 0);
    setTaskCount(tasks.count ?? 0);
    setUnitCount(units.count ?? 0);
    setUpcomingArrivals(arrivals.count ?? 0);
  };

  loadDashboardStats();
}, [authLoading, isAuthenticated]);
useEffect(() => {
    if (authLoading || !isAuthenticated) return;
  const loadTodayTasks = async () => {
    const now = new Date();

    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, due_at, status, property_id, unit_id")
      .gte("due_at", now.toISOString())
      .in("status", ["pending", "in_progress"])
      .order("due_at", { ascending: true })
      .limit(5);

    if (error) {
      console.error("Erreur chargement tâches :", error.message);
      return;
    }

    setTodayTasks((data ?? []) as DashboardTask[]);
    const [{ data: propertiesData }, { data: unitsData }] =
  await Promise.all([
    supabase.from("properties").select("id, name"),
    supabase.from("units").select("id, name"),
  ]);

setDashboardProperties(propertiesData ?? []);
setDashboardUnits(unitsData ?? []);
  };

  loadTodayTasks();
}, [authLoading, isAuthenticated]);

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setIsAuthenticated(!!session);
    setAuthLoading(false);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("ÉVÉNEMENT SUPABASE :", event);

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
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      },
    })
      .then((response) => {
        setConnectionStatus(
          response.ok
            ? "Connexion Supabase réussie"
            : `Serveur joignable, erreur HTTP ${response.status}`
        );
      })
      .catch(() => {
        setConnectionStatus("Connexion Supabase impossible");
      });
  }, []);

  useEffect(() => {
      if (authLoading || !isAuthenticated) return;
    const testDatabase = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .limit(1);

      if (error) {
        setDatabaseStatus(`Erreur : ${error.message}`);
      } else {
        setDatabaseStatus(
          `Lecture réussie (${data.length} résultat(s))`
        );
      }
    };

    testDatabase();
  }, [authLoading, isAuthenticated]);

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
    <a
  href="#dashboard"
  onClick={() => setActiveSection("dashboard")}
  className={`rounded-xl px-4 py-3 text-sm transition ${
    activeSection === "dashboard"
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`}
>
  <span className="flex items-center gap-3">
  <LayoutDashboard size={18} strokeWidth={1.7} />
  Vue d'ensemble
</span>
</a>
    <a
  href="#etablissements"
  onClick={() => setActiveSection("etablissements")}
  className={`rounded-xl px-4 py-3 text-sm transition ${
    activeSection === "etablissements"
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`}
>
  <span className="flex items-center gap-3">
  <Building2 size={18} strokeWidth={1.7} />
  Établissements
</span>
</a>
    <a
  href="#logements"
  onClick={() => setActiveSection("logements")}
  className={`rounded-xl px-4 py-3 text-sm transition ${
    activeSection === "logements"
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`}
>
  <span className="flex items-center gap-3">
  <BedDouble size={18} strokeWidth={1.7} />
  Logements
</span>
</a>
    <a
  href="#reservations"
  onClick={() => setActiveSection("reservations")}
  className={`rounded-xl px-4 py-3 text-sm transition ${
    activeSection === "reservations"
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`}
>
  <span className="flex items-center gap-3">
  <CalendarDays size={18} strokeWidth={1.7} />
  Réservations
</span>
</a>
    <a
  href="#calendrier"
  onClick={() => setActiveSection("calendrier")}
  className={`rounded-xl px-4 py-3 text-sm transition ${
    activeSection === "calendrier"
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`}
>
  <span className="flex items-center gap-3">
  <CalendarRange size={18} strokeWidth={1.7} />
  Calendrier
</span>
</a>
    <a
  href="#taches"
  onClick={() => setActiveSection("taches")}
  className={`rounded-xl px-4 py-3 text-sm transition ${
    activeSection === "taches"
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`}
>
  <span className="flex items-center gap-3">
  <ClipboardList size={18} strokeWidth={1.7} />
  Tâches
</span>
</a>
  </nav>

  <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.05] p-4">
    <p className="text-xs font-medium text-white">Gîte Assistant</p>
    <p className="mt-1 text-[11px] text-slate-400">
      Votre espace de gestion intelligent.
    </p>
  </div>
</aside>
<nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e2e7ef] bg-white/95 px-2 py-3 shadow-[0_-8px_30px_rgba(23,45,77,0.08)] backdrop-blur-xl lg:hidden">
  <div className="flex items-center justify-around">
    {[
      { id: "dashboard", label: "Accueil", icon: LayoutDashboard, href: "#dashboard" },
      { id: "etablissements", label: "Établ.", icon: Building2, href: "#etablissements" },
      { id: "logements", label: "Logements", icon: BedDouble, href: "#logements" },
      { id: "reservations", label: "Réserv.", icon: CalendarDays, href: "#reservations" },
      { id: "calendrier", label: "Calendrier", icon: CalendarRange, href: "#calendrier" },
      { id: "taches", label: "Tâches", icon: ClipboardList, href: "#taches" },
    ].map((item) => (
      <a
        key={item.id}
        href={item.href}
        onClick={() => setActiveSection(item.id)}
        className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[9px] transition-colors ${
          activeSection === item.id
            ? "font-semibold text-[#29466b]"
            : "text-slate-400"
        }`}
      >
        <item.icon size={19} strokeWidth={1.8} />
        <span>{item.label}</span>
      </a>
    ))}
  </div>
</nav>
    <div className="lg:ml-64">
  <p className="px-6 py-2 text-sm">
    Connexion Supabase : {connectionStatus}
  </p>
  <p className="px-6 py-2 text-sm">
    Base de données : {databaseStatus}
  </p>
</div>

<header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-[#e2e7ef]/80 bg-white/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:ml-64 lg:px-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#172d4d]">
            Gîte<span className="text-[#29466b]">Assistant</span>
          </h1>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
            Votre gestion, intelligemment simplifiée.
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-3">
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

<div id="dashboard" className="mx-auto max-w-[1600px] px-4 pt-8 pb-28 sm:px-6 sm:pt-10 lg:ml-64 lg:px-12 lg:pb-10 xl:px-16">
        <section className="mb-9">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#5279a8]">
  VOTRE ESPACE DE GESTION
</p>
<h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#172d4d] sm:text-4xl">
  Bonjour 👋
</h2>
<p className="mt-2 text-[15px] leading-7 text-slate-500">
  Voici un aperçu de votre activité.
</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
  { label: "Établissements", value: propertyCount, icon: Building2 },
  { label: "Réservations", value: reservationCount, icon: CalendarDays },
  { label: "Tâches en cours", value: taskCount, icon: ClipboardList },
  { label: "Arrivées à venir", value: upcomingArrivals, icon: CalendarRange },
].map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9fb5cf] hover:shadow-[0_16px_40px_rgba(23,45,77,0.12)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce5f0] bg-gradient-to-br from-[#f5f8fc] to-[#eaf0f7] text-[#29466b] shadow-sm transition-all duration-300 group-hover:border-[#b9c9dc] group-hover:shadow-md">
  <item.icon size={21} strokeWidth={1.7} />
</span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums text-[#172d4d] sm:mt-5 sm:text-3xl">
  {item.value}
</p>
            </div>
          ))}
        </section>

       <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-all duration-300 hover:border-[#c5d2e2] hover:shadow-[0_16px_40px_rgba(23,45,77,0.08)] lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight text-[#172d4d]">Prochaines tâches</h3>
              <span className="rounded-full border border-[#e2e7ef] bg-[#f5f7fa] px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-[#5279a8]">
  APERÇU
</span>
            </div>

              <div className="mt-6 space-y-5">
  {todayTasks.length === 0 ? (
    <p className="text-sm text-gray-500">
      Aucune tâche prévue aujourd'hui.
    </p>
  ) : (
    todayTasks.map((task) => (
      <div
        key={task.id}
        className="group/task flex flex-col gap-3 rounded-xl border border-transparent border-b-[#e8edf3] px-3 py-4 transition-all duration-200 hover:border-[#e2e7ef] hover:bg-[#f8fafd] hover:shadow-sm sm:flex-row sm:items-center"
      >
        <span className="shrink-0 rounded-lg border border-[#e2e7ef] bg-[#f5f8fc] px-3 py-2 text-xs font-semibold tabular-nums text-[#29466b]">
          {new Date(task.due_at).toLocaleString("fr-FR", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})}
        </span>

        <div className="flex-1">
  <p className="text-sm font-semibold tracking-tight text-[#172d4d]">
  {task.title}
</p>

  <p className="mt-1 text-xs leading-5 text-slate-500">
    Établissement :{" "}
    {dashboardProperties.find(
      (property) => property.id === task.property_id
    )?.name ?? "Établissement inconnu"}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-500">
    Logement :{" "}
    {dashboardUnits.find(
      (unit) => unit.id === task.unit_id
    )?.name ?? "Non précisé"}
  </p>
</div>

        <div className="flex flex-wrap items-center gap-2">
  <span className="w-fit rounded-full border border-[#dce5f0] bg-[#f5f8fc] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#29466b]">
    {task.status === "pending"
      ? "À effectuer"
      : task.status === "in_progress"
        ? "En cours"
        : "Terminée"}
  </span>

  {task.status === "pending" && (
    <button
      onClick={() =>
        updateDashboardTaskStatus(task.id, "in_progress")
      }
      className="rounded-lg border border-[#dce5f0] bg-[#f5f8fc] px-3 py-2 text-xs font-semibold text-[#29466b] transition-all duration-200 hover:border-[#9fb5cf] hover:bg-[#eaf0f7] hover:shadow-sm"
    >
      Commencer
    </button>
  )}

  {task.status === "in_progress" && (
    <button
      onClick={() =>
        updateDashboardTaskStatus(task.id, "completed")
      }
      className="rounded-lg border border-[#d5e7dd] bg-[#f1f8f4] px-3 py-2 text-xs font-semibold text-[#27845d] transition-all duration-200 hover:border-[#a8d0ba] hover:bg-[#e7f3ec] hover:shadow-sm"
    >
      Terminer
    </button>
  )}
</div>
      </div>
    ))
  )}

</div>

          </div>

<div className="relative overflow-hidden rounded-2xl border border-[#29466b] bg-gradient-to-br from-[#101e33] via-[#172d4d] to-[#29466b] p-5 sm:p-7 text-white shadow-[0_16px_40px_rgba(23,45,77,0.18)] transition-all duration-300 hover:shadow-[0_20px_45px_rgba(23,45,77,0.25)]">
           <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-300/10 blur-3xl" />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl leading-none text-blue-200 shadow-inner">
  ✦
</div>
            <p className="mt-5 text-xs font-semibold tracking-widest text-blue-200">
              INTELLIGENCE ARTIFICIELLE
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
  Votre assistant intelligent.
</h3>
            <p className="mt-3 text-sm leading-7 text-blue-100/90">
              Gîte Assistant vous aidera à organiser vos opérations,
              anticiper les imprévus et simplifier votre quotidien.
            </p>
            <div className="mt-7 rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-inner backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-white/[0.11]">
              <p className="text-sm font-medium">
                Votre assistant se prépare...
              </p>
              <p className="mt-1 text-xs text-slate-200">
                Les fonctionnalités IA seront connectées progressivement.
              </p>
            </div>
          </div>
        </section>
<OrganizationForm />
<div id="etablissements" className="scroll-mt-8">
  <PropertyForm />
  <PropertyList />
</div>
       <div id="logements" className="scroll-mt-8">
  <UnitForm />
  <UnitList />
</div>
        <div id="reservations" className="scroll-mt-8">
  <ReservationForm />
  <ReservationList />
</div>
        <div id="calendrier" className="scroll-mt-8">
  <ReservationCalendar />
</div>
        <div id="taches" className="scroll-mt-8">
  <TaskForm />
  <TaskList />
</div>
        <footer className="mt-12 border-t border-[#e2e7ef] pt-6 text-center text-xs tracking-wide text-[#8993a3]">
          Gîte Assistant · Votre gestion, intelligemment simplifiée.
          <br />
          Prototype de démonstration
        </footer>
      </div>
    </main>
  );
}
