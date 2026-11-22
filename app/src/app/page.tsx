"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  CalendarRange,
  ClipboardList,
    Wallet,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { getLocalDate } from "../lib/date-utils";
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
  timezone: string | null;
};

type DashboardUnit = {
  id: string;
  name: string;
  property_id: string;
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
const [occupancyRate, setOccupancyRate] = useState(0);
const [upcomingArrivals, setUpcomingArrivals] = useState(0);
const [todayArrivals, setTodayArrivals] = useState(0);
const [todayDepartures, setTodayDepartures] = useState(0);
const [occupiedUnitsToday, setOccupiedUnitsToday] = useState(0);
const [totalRevenue, setTotalRevenue] = useState(0);
const [totalPaid, setTotalPaid] = useState(0);
const [totalOutstanding, setTotalOutstanding] = useState(0);
const [monthlyRevenue, setMonthlyRevenue] = useState<
  { month: string; revenue: number }[]
>([]);
const [monthlyPaid, setMonthlyPaid] = useState<
  { month: string; paid: number }[]
>([]);
const [todayTasks, setTodayTasks] = useState<DashboardTask[]>([]);
const [dashboardProperties, setDashboardProperties] = useState<DashboardProperty[]>([]);
const [selectedPropertyId, setSelectedPropertyId] = useState("all");
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
    const propertyFilter = selectedPropertyId !== "all";
    let reservationsQuery = supabase
  .from("reservations")
  .select("*", { count: "exact", head: true });

if (propertyFilter) {
  reservationsQuery = reservationsQuery.eq(
    "property_id",
    selectedPropertyId
  );
}

let arrivalsQuery = supabase
  .from("reservations")
  .select("*", { count: "exact", head: true })
  .gte("check_in", new Date().toISOString().split("T")[0])
  .in("status", ["pending", "confirmed"]);

if (propertyFilter) {
  arrivalsQuery = arrivalsQuery.eq("property_id", selectedPropertyId);
}
let financialReservationsQuery = supabase
  .from("reservations")
  .select("property_id, unit_id, total_amount, paid_amount, status, check_in, check_out")
  .neq("status", "cancelled");

if (propertyFilter) {
  financialReservationsQuery = financialReservationsQuery.eq(
    "property_id",
    selectedPropertyId
  );
}
let tasksQuery = supabase
  .from("tasks")
  .select("*", { count: "exact", head: true })
  .in("status", ["pending", "in_progress"]);

if (propertyFilter) {
  tasksQuery = tasksQuery.eq("property_id", selectedPropertyId);
}
let unitsQuery = supabase
  .from("units")
  .select("id, property_id", { count: "exact" });

if (propertyFilter) {
  unitsQuery = unitsQuery.eq("property_id", selectedPropertyId);
}
    const [properties, reservations, tasks, units, arrivals, financialReservations] =
      await Promise.all([
        supabase
  .from("properties")
  .select("id, timezone", { count: "exact" }),

        reservationsQuery,

        tasksQuery,

        unitsQuery,

arrivalsQuery,

financialReservationsQuery,
      ]);

      setPropertyCount(
  selectedPropertyId === "all" ? properties.count ?? 0 : 1
);
    setReservationCount(reservations.count ?? 0);
    setTaskCount(tasks.count ?? 0);
    setUnitCount(units.count ?? 0);
    setUpcomingArrivals(arrivals.count ?? 0);
    const financialData = financialReservations.data ?? [];
    
const now = new Date();


const propertyLocalDates = new Map(
  (properties.data ?? []).map((property) => [
    property.id,
    getLocalDate(now, property.timezone || "Europe/Paris"),
  ])
);

const getToday = (propertyId: string) =>
  propertyLocalDates.get(propertyId) ?? getLocalDate(now, "Europe/Paris");

const arrivalsToday = financialData.filter(
  (reservation) =>
    reservation.check_in === getToday(reservation.property_id) &&
    ["pending", "confirmed"].includes(reservation.status)
);

const departuresToday = financialData.filter(
  (reservation) =>
    reservation.check_out === getToday(reservation.property_id) &&
    ["confirmed", "completed"].includes(reservation.status)
);

const occupiedUnits = new Set(
  financialData
    .filter(
      (reservation) => {
        const today = getToday(reservation.property_id);

        return (
          reservation.check_in <= today &&
          reservation.check_out > today &&
          ["confirmed", "completed"].includes(reservation.status)
        );
      }
    )
    .map((reservation) => reservation.unit_id)
    .filter(Boolean)
);

setTodayArrivals(arrivalsToday.length);
setTodayDepartures(departuresToday.length);
setOccupiedUnitsToday(occupiedUnits.size);

const occupiedNights = new Set<string>();
let availableNights = 0;

const relevantProperties = (properties.data ?? []).filter(
  (property) =>
    !propertyFilter || property.id === selectedPropertyId
);

const unitData = units.data ?? [];

relevantProperties.forEach((property) => {
  const today = getToday(property.id);
  const currentMonth = today.slice(0, 7);
  const currentMonthStart = `${currentMonth}-01`;

  const [year, month] = currentMonth.split("-").map(Number);

  const nextMonthStart = new Date(
    Date.UTC(year, month, 1)
  ).toISOString().split("T")[0];

  const daysInCurrentMonth = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  const propertyUnits = unitData.filter(
    (unit) => unit.property_id === property.id
  );

  availableNights += propertyUnits.length * daysInCurrentMonth;

  financialData.forEach((reservation) => {
    if (
      reservation.property_id !== property.id ||
      !reservation.unit_id ||
      !reservation.check_in ||
      !reservation.check_out ||
      !["confirmed", "completed"].includes(reservation.status)
    ) return;

    const startNight =
      reservation.check_in > currentMonthStart
        ? reservation.check_in
        : currentMonthStart;

    const endNight =
      reservation.check_out < nextMonthStart
        ? reservation.check_out
        : nextMonthStart;

    const night = new Date(`${startNight}T00:00:00Z`);
    const endDate = new Date(`${endNight}T00:00:00Z`);

    while (night < endDate) {
      occupiedNights.add(
        `${reservation.unit_id}-${night.toISOString().split("T")[0]}`
      );

      night.setUTCDate(night.getUTCDate() + 1);
    }
  });
});

setOccupancyRate(
  availableNights > 0
    ? Math.round((occupiedNights.size / availableNights) * 100)
    : 0
);

const chartProperties = (properties.data ?? []).filter(
  (property) =>
    !propertyFilter || property.id === selectedPropertyId
);

const propertyMonthWindows = new Map<string, Set<string>>();
const monthKeys = new Set<string>();

chartProperties.forEach((property) => {
  const today = getToday(property.id);
  const [year, month] = today.slice(0, 7).split("-").map(Number);

  const propertyMonths = new Set<string>();

  for (let index = 5; index >= 0; index--) {
    const date = new Date(Date.UTC(year, month - 1 - index, 1));

    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    propertyMonths.add(key);
    monthKeys.add(key);
  }

  propertyMonthWindows.set(property.id, propertyMonths);
});

const months = Array.from(monthKeys)
  .sort()
  .map((key) => ({
    key,
    label: new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${key}-01T12:00:00Z`)),
  }));

const monthlyTotals = new Map(
  months.map(({ key }) => [key, 0])
);

const monthlyPaidTotals = new Map(
  months.map(({ key }) => [key, 0])
);

financialData.forEach((reservation) => {
  if (!reservation.check_in) return;

  const key = reservation.check_in.slice(0, 7);

  const propertyMonths = propertyMonthWindows.get(
    reservation.property_id
  );

  if (!propertyMonths?.has(key)) return;

  monthlyTotals.set(
    key,
    (monthlyTotals.get(key) ?? 0) +
      Number(reservation.total_amount ?? 0)
  );

  monthlyPaidTotals.set(
    key,
    (monthlyPaidTotals.get(key) ?? 0) +
      Number(reservation.paid_amount ?? 0)
  );
});

setMonthlyRevenue(
  months.map(({ key, label }) => ({
    month: label,
    revenue: monthlyTotals.get(key) ?? 0,
  }))
);

setMonthlyPaid(
  months.map(({ key, label }) => ({
    month: label,
    paid: monthlyPaidTotals.get(key) ?? 0,
  }))
);

const revenue = financialData.reduce(
  (total, reservation) => total + Number(reservation.total_amount ?? 0),
  0
);

const paid = financialData.reduce(
  (total, reservation) => total + Number(reservation.paid_amount ?? 0),
  0
);

const outstanding = financialData.reduce(
  (total, reservation) =>
    total + Math.max(
      0,
      Number(reservation.total_amount ?? 0) -
      Number(reservation.paid_amount ?? 0)
    ),
  0
);
setTotalRevenue(revenue);
setTotalPaid(paid);
setTotalOutstanding(outstanding);
  };

  loadDashboardStats();
  }, [authLoading, isAuthenticated, selectedPropertyId]);

    
useEffect(() => {
  if (authLoading || !isAuthenticated) return;

  const loadTodayTasks = async () => {
    const now = new Date();

    let tasksQuery = supabase
      .from("tasks")
      .select("id, title, due_at, status, property_id, unit_id")
      .gte("due_at", now.toISOString())
      .in("status", ["pending", "in_progress"]);

    if (selectedPropertyId !== "all") {
      tasksQuery = tasksQuery.eq("property_id", selectedPropertyId);
    }

    const { data, error } = await tasksQuery
      .order("due_at", { ascending: true })
      .limit(5);

    if (error) {
      console.error("Erreur chargement tâches :", error.message);
      return;
    }

    setTodayTasks((data ?? []) as DashboardTask[]);

    const [{ data: propertiesData }, { data: unitsData }] =
      await Promise.all([
        supabase.from("properties").select("id, name, timezone"),
        supabase.from("units").select("id, name, property_id"),
      ]);

    setDashboardProperties(propertiesData ?? []);
    setDashboardUnits(unitsData ?? []);
  };

  loadTodayTasks();
}, [authLoading, isAuthenticated, selectedPropertyId]);

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
        <section className="mb-9 rounded-3xl border border-[#e2e7ef] bg-gradient-to-br from-white via-white to-[#edf2f8] p-6 shadow-[0_10px_35px_rgba(23,45,77,0.05)] sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#dce5f0] bg-[#f5f8fc] px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-[#5279a8]">
  VOTRE ESPACE DE GESTION
</p>
<h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#101e33] sm:text-5xl">
  Bonjour 👋
</h2>
<p className="mt-3 max-w-xl text-sm leading-7 text-[#697586] sm:text-[15px]">
  Voici un aperçu de votre activité.
</p>
<div className="mt-6 max-w-sm">
  <label className="mb-2 block text-sm font-medium text-[#344054]">
    Établissement affiché
  </label>

  <select
    value={selectedPropertyId}
    onChange={(e) => setSelectedPropertyId(e.target.value)}
    className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-sm text-[#171d29] outline-none transition focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
  >
    <option value="all">Tous les établissements</option>

    {dashboardProperties.map((property) => (
      <option key={property.id} value={property.id}>
        {property.name}
      </option>
    ))}
  </select>
</div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
  { label: "Établissements", value: propertyCount, icon: Building2 },
  { label: "Réservations", value: reservationCount, icon: CalendarDays },
  { label: "Tâches en cours", value: taskCount, icon: ClipboardList },
  { label: "Arrivées à venir", value: upcomingArrivals, icon: CalendarRange },
  { label: "Montant total réservé", value: `${totalRevenue.toLocaleString("fr-FR")} €`, icon: Wallet },
{ label: "Montant encaissé", value: `${totalPaid.toLocaleString("fr-FR")} €`, icon: CreditCard },
{ label: "Reste à encaisser", value: `${totalOutstanding.toLocaleString("fr-FR")} €`, icon: TrendingUp },
{ label: "Taux d'occupation", value: `${occupancyRate} %`, icon: BedDouble },
].map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-3xl border border-[#e6eaf0] bg-white p-5 shadow-[0_4px_20px_rgba(16,30,51,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c5d2e2] hover:shadow-[0_18px_40px_rgba(16,30,51,0.09)] sm:p-6"
            >
              <div className="flex items-center justify-between">
  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8993a2]">
    {item.label}
  </p>

  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5eaf1] bg-[#f1f5fa] text-[#29466b] transition-all duration-300 group-hover:border-[#b9c9dc] group-hover:bg-[#e8eff7] group-hover:shadow-sm sm:h-11 sm:w-11">
    <item.icon size={21} strokeWidth={1.7} />
  </span>
</div>
{item.label === "Taux d'occupation" ? (
  <div className="mt-5 flex items-center gap-4 sm:mt-6">
    <div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#29466b ${occupancyRate * 3.6}deg, #edf0f4 0deg)`,
      }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <span className="text-sm font-bold tabular-nums text-[#101e33]">
          {occupancyRate}%
        </span>
      </div>
    </div>
    <p className="text-sm text-[#8993a2]">
      Occupation ce mois-ci
    </p>
  </div>
) : (
  <p className="mt-5 text-4xl font-semibold tracking-[-0.05em] tabular-nums text-[#101e33] sm:mt-6 sm:text-[42px]">
    {item.value}
  </p>
)}
            </div>
          ))}
        </section>
<section className="mt-6">
  <div className="mb-4">
    <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#101e33]">
      Activité du jour
    </h3>
    <p className="mt-1 text-sm text-[#8993a2]">
      Vue d'ensemble de l'activité opérationnelle
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {[
      {
        label: "Arrivées aujourd'hui",
        value: todayArrivals,
        icon: CalendarDays,
      },
      {
        label: "Départs aujourd'hui",
        value: todayDepartures,
        icon: CalendarRange,
      },
      {
        label: "Logements occupés",
        value: occupiedUnitsToday,
        icon: BedDouble,
      },
    ].map((item) => (
      <div
        key={item.label}
        className="rounded-3xl border border-[#e6eaf0] bg-white p-5 shadow-[0_4px_20px_rgba(16,30,51,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c5d2e2] hover:shadow-[0_18px_40px_rgba(16,30,51,0.09)] sm:p-6"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8993a2]">
            {item.label}
          </p>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5eaf1] bg-[#f1f5fa] text-[#29466b]">
            <item.icon size={21} strokeWidth={1.7} />
          </span>
        </div>
        <p className="mt-5 text-4xl font-semibold tracking-[-0.05em] tabular-nums text-[#101e33]">
          {item.value}
        </p>
      </div>
    ))}
  </div>
</section>
<section className="mt-6 rounded-3xl border border-[#e6eaf0] bg-white p-5 shadow-[0_4px_20px_rgba(16,30,51,0.035)] sm:p-7">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#101e33] sm:text-2xl">
        Évolution des réservations
      </h3>
      <p className="mt-1 text-sm text-[#8993a2]">
        Montants réservés selon le mois d'arrivée
      </p>
    </div>

    <span className="rounded-full border border-[#dce5f0] bg-[#f1f5fa] px-3 py-1.5 text-xs font-semibold text-[#45658c]">
      6 derniers mois
    </span>
  </div>
<div className="mt-6 grid grid-cols-2 gap-3">
  <div className="rounded-2xl border border-[#e6eaf0] bg-[#f8f9fb] p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8993a2]">
      Total réservé
    </p>
    <p className="mt-2 text-xl font-semibold tracking-tight text-[#172d4d]">
      {monthlyRevenue
        .reduce((total, item) => total + item.revenue, 0)
        .toLocaleString("fr-FR")} €
    </p>
    <p className="mt-1 text-xs text-[#8993a2]">
      Sur les 6 derniers mois
    </p>
  </div>

  <div className="rounded-2xl border border-[#e6eaf0] bg-[#f8f9fb] p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8993a2]">
      Meilleur mois
    </p>
    <p className="mt-2 text-xl font-semibold tracking-tight text-[#172d4d]">
      {monthlyRevenue.length > 0
        ? monthlyRevenue.reduce((best, item) =>
            item.revenue > best.revenue ? item : best
          ).month
        : "—"}
    </p>
    <p className="mt-1 text-xs text-[#8993a2]">
      Meilleur montant réservé
    </p>
  </div>
</div>
  <div className="mt-8 grid grid-cols-6 gap-2 sm:gap-5">
    {monthlyRevenue.map((item, index) => {
      const maxRevenue = Math.max(
        ...monthlyRevenue.map((entry) => entry.revenue),
        1
      );

      const barHeight = (item.revenue / maxRevenue) * 100;

      return (
        <div key={`${item.month}-${index}`} className="flex min-w-0 flex-col items-center">
          <p className="mb-3 text-center text-[10px] font-semibold text-[#45658c] sm:text-xs">
            {item.revenue.toLocaleString("fr-FR")} €
          </p>

          
          <div className="relative flex h-36 w-full items-end justify-center overflow-hidden rounded-xl border border-[#edf0f4] bg-[#f8f9fb] p-1.5 sm:p-2">
  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#dce3ec]" />

  <div
    className="relative z-10 w-full max-w-12 rounded-lg bg-gradient-to-t from-[#172d4d] to-[#5279a8] transition-all duration-500"
    style={{
      height: `${barHeight}%`,
      minHeight: item.revenue > 0 ? "6px" : "3px",
background: item.revenue > 0
  ? undefined
  : "#dce3ec",
    }}
  />
</div>

          <p className="mt-3 text-[10px] font-semibold capitalize text-[#858e9b] sm:text-xs">
            {item.month}
          </p>
        </div>
      );
    })}
  </div>
</section>

<section className="mt-6 rounded-3xl border border-[#e6eaf0] bg-white p-5 shadow-[0_4px_20px_rgba(16,30,51,0.035)] sm:p-7">
  <div>
    <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#101e33] sm:text-2xl">
      Réservé vs encaissé
    </h3>
    <p className="mt-1 text-sm text-[#8993a2]">
      Comparaison des montants par mois d'arrivée
    </p>
  </div>

  <div className="mt-6 flex flex-wrap gap-5">
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm bg-[#29466b]" />
      <span className="text-xs text-[#697586]">Montant réservé</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm bg-[#8da8c8]" />
      <span className="text-xs text-[#697586]">Montant encaissé</span>
    </div>
  </div>

  <div className="mt-8 space-y-6">
    {monthlyRevenue.map((item, index) => {
      const paid = monthlyPaid[index]?.paid ?? 0;
      const maxAmount = Math.max(
        ...monthlyRevenue.map((entry) => entry.revenue),
        1
      );

      return (
        <div key={`${item.month}-${index}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold capitalize text-[#45658c]">
              {item.month}
            </span>
            <span className="text-[11px] tabular-nums text-[#8993a2]">
              {item.revenue.toLocaleString("fr-FR")} € / {paid.toLocaleString("fr-FR")} €
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-3 overflow-hidden rounded-full bg-[#f1f3f6]">
              <div
                className="h-full rounded-full bg-[#29466b] transition-all duration-500"
                style={{ width: `${(item.revenue / maxAmount) * 100}%` }}
              />
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#f1f3f6]">
              <div
                className="h-full rounded-full bg-[#8da8c8] transition-all duration-500"
                style={{ width: `${(paid / maxAmount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
</section>
<section className="mt-6 overflow-hidden rounded-3xl border border-[#e6eaf0] bg-white p-5 shadow-[0_4px_20px_rgba(16,30,51,0.035)] sm:p-7">
  <div>
    <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#101e33] sm:text-2xl">
      Performance financière
    </h3>
    <p className="mt-1 text-sm text-[#8993a2]">
      Suivi de vos encaissements
    </p>
  </div>

  <div className="mt-7 grid gap-6 sm:grid-cols-2">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8993a2]">
        Taux d'encaissement
      </p>

      <p className="mt-2 text-4xl font-semibold tracking-tight text-[#172d4d]">
        {totalRevenue > 0
          ? Math.round((totalPaid / totalRevenue) * 100)
          : 0}%
      </p>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf0f4]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#172d4d] to-[#5279a8] transition-all duration-700"
          style={{
            width: `${totalRevenue > 0
              ? Math.min((totalPaid / totalRevenue) * 100, 100)
              : 0}%`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-[#8993a2]">
        Part du montant total déjà encaissée
      </p>
    </div>

    <div className="rounded-2xl border border-[#e6eaf0] bg-[#f8f9fb] p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8993a2]">
        Reste à percevoir
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-[#172d4d]">
        {totalOutstanding.toLocaleString("fr-FR")} €
      </p>
      <p className="mt-2 text-xs text-[#8993a2]">
        Montant restant sur vos réservations
      </p>
    </div>
  </div>
</section>
       <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-[#e9edf2] bg-white p-5 shadow-[0_6px_28px_rgba(16,30,51,0.04)] transition-all duration-300 hover:border-[#c5d2e2] hover:shadow-[0_16px_40px_rgba(16,30,51,0.08)] sm:p-7 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#101e33] sm:text-2xl">
  Prochaines tâches
</h3>
              <span className="rounded-full border border-[#dce5f0] bg-[#edf2f8]/80 px-3 py-1.5 text-[9px] font-semibold tracking-[0.18em] text-[#45658c]">
  APERÇU
</span>
            </div>

              <div className="mt-7 space-y-4">
  {todayTasks.length === 0 ? (
    <p className="text-sm text-gray-500">
      Aucune tâche prévue aujourd'hui.
    </p>
  ) : (
    todayTasks.map((task) => (
      <div
        key={task.id}
        className="group/task flex flex-col gap-3 rounded-2xl border border-[#edf0f3] bg-[#fcfdfe] px-4 py-4 shadow-[0_2px_10px_rgba(16,30,51,0.025)] transition-all duration-300 hover:border-[#d5e0ed] hover:bg-white hover:shadow-[0_8px_22px_rgba(16,30,51,0.06)] sm:flex-row sm:items-center sm:px-5"
      >
        <span className="shrink-0 rounded-xl border border-[#e5eaf0] bg-[#f5f7fa] px-3.5 py-3 text-xs font-semibold tracking-tight tabular-nums text-[#29466b] transition-colors duration-200 group-hover/task:bg-[#edf2f8]">
          {new Date(task.due_at).toLocaleString("fr-FR", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})}
        </span>

        <div className="flex-1">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#172d4d] sm:text-base">
  {task.title}
</p>

<p className="mt-1 text-xs leading-5 text-[#858e9b] sm:text-[13px]">
    Établissement :{" "}
    {dashboardProperties.find(
      (property) => property.id === task.property_id
    )?.name ?? "Établissement inconnu"}
  </p>

  <p className="mt-1 text-[11px] leading-5 text-[#8993a3] sm:text-xs">
    Logement :{" "}
    {dashboardUnits.find(
      (unit) => unit.id === task.unit_id
    )?.name ?? "Non précisé"}
  </p>
</div>

        <div className="flex flex-wrap items-center gap-2">
  <span className="w-fit rounded-full border border-[#e2e8f0] bg-[#f4f6f9] px-3.5 py-2 text-[10px] font-semibold tracking-[0.06em] text-[#45658c]">
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
      className="rounded-xl border border-[#dce5f0] bg-white px-4 py-2.5 text-xs font-semibold tracking-tight text-[#29466b] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9fb5cf] hover:bg-[#f5f8fc] hover:shadow-sm"
    >
      Commencer
    </button>
  )}

  {task.status === "in_progress" && (
    <button
      onClick={() =>
        updateDashboardTaskStatus(task.id, "completed")
      }
      className="rounded-xl border border-[#d5e7dd] bg-white px-4 py-2.5 text-xs font-semibold tracking-tight text-[#27845d] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a8d0ba] hover:bg-[#f1f8f4] hover:shadow-sm"
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

<div className="relative overflow-hidden rounded-3xl border border-[#29466b] bg-gradient-to-br from-[#101e33] via-[#172d4d] to-[#29466b] p-6 sm:p-7 text-white shadow-[0_12px_35px_rgba(16,30,51,0.16)] transition-all duration-300 hover:shadow-[0_18px_42px_rgba(16,30,51,0.22)]">
  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-300/10 blur-3xl" />
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl leading-none text-blue-200 shadow-inner">
    ✦
  </div>
  <p className="mt-5 text-xs font-semibold tracking-widest text-blue-200">
    INTELLIGENCE ARTIFICIELLE
  </p>
  <h3 className="mt-4 text-[26px] font-semibold tracking-[-0.04em] text-white sm:text-3xl">
    Votre assistant intelligent.
  </h3>
  <p className="mt-3 text-[13px] leading-7 text-blue-100/85 sm:text-sm">
    Gîte Assistant vous aidera à organiser vos opérations,
    anticiper les imprévus et simplifier votre quotidien.
  </p>
  <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09]">
    <p className="text-[15px] font-semibold tracking-tight text-white">
      Votre assistant se prépare...
    </p>
    <p className="mt-2 text-xs leading-6 text-blue-100/75">
      Les fonctionnalités IA seront connectées progressivement.
    </p>
  </div>
</div>
</section>

<div className="mt-10">
  <OrganizationForm />
</div>

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
